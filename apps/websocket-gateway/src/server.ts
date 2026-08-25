import { startApplication } from "@powerchain/application-runtime";
import { gateway } from "@powerchain/websocket";
import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { realtimeEvents } from "@powerchain/database/realtime";
import { application } from "./index.ts";

function ticketSecret(){const value=process.env.POWERCHAIN_REALTIME_TICKET_SECRET?.trim()||process.env.POWERCHAIN_INTERNAL_SERVICE_SECRET?.trim();if(!value)throw new Error("POWERCHAIN_REALTIME_TICKET_SECRET is required");return value}
async function main(){
  const runtime=startApplication(application,3107);
  const realtime=gateway.createPowerChainWebSocketServer({server:runtime.server,path:"/ws",ticketSecret:ticketSecret(),heartbeatMs:25_000,replay:async({ticket,channels,after,limit})=>(await realtimeEvents.replay({organizationId:ticket.organizationId,channels,after,limit})).map(event=>({...event,sentAt:event.createdAt}))});
  let lastSequence=await realtimeEvents.latestSequence();let listener:{query:(text:string)=>Promise<unknown>;on:(event:string,handler:(message:any)=>void)=>void;release:()=>void}|undefined;let polling=false;let stopping=false;
  const publishEvent=async(sequence:number)=>{const event=await realtimeEvents.get(sequence);if(!event)return;lastSequence=Math.max(lastSequence,event.sequence);realtime.publish({...event,sentAt:event.createdAt})};
  const catchUp=async()=>{if(stopping)return;try{for(const event of await realtimeEvents.replayAll(lastSequence,500)){lastSequence=Math.max(lastSequence,event.sequence);realtime.publish({...event,sentAt:event.createdAt})}polling=false}catch{polling=true}};
  try{listener=await getPostgresPool().connect();await listener.query("listen powerchain_realtime");listener.on("notification",message=>{try{const payload=JSON.parse(message.payload??"{}") as{sequence?:number};if(payload.sequence)void publishEvent(payload.sequence)}catch{polling=true}});listener.on("error",()=>{polling=true})}catch{polling=true}
  const fallback=setInterval(()=>void catchUp(),polling?1500:5000);fallback.unref?.();
  const status=setInterval(()=>void realtimeEvents.append({channel:"platform.status",event:"powerchain.realtime.gateway.status.v1",data:{status:"online",connections:realtime.connectionCount(),transport:"websocket",pollingFallbackActive:polling,observedAt:new Date().toISOString()},ttlSeconds:900}).catch(()=>undefined),30_000);status.unref?.();
  const shutdown=async()=>{if(stopping)return;stopping=true;clearInterval(fallback);clearInterval(status);if(listener){await listener.query("unlisten powerchain_realtime").catch(()=>undefined);listener.release()}await realtime.close();await runtime.close()};
  process.once("SIGINT",()=>void shutdown());process.once("SIGTERM",()=>void shutdown());
}
void main().catch(error=>{process.stderr.write(`${error instanceof Error?error.stack??error.message:String(error)}\n`);process.exitCode=1});
