import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { acpAdapterGateway } from "@powerchain/acp-sdk/gateway";
const state={startedAt:new Date().toISOString(),lastCycles:{} as Record<string,{at:string;result:unknown;error?:string}>};
export function recordCycle(name:string,result:unknown,error?:unknown){state.lastCycles[name]={at:new Date().toISOString(),result,...(error?{error:error instanceof Error?error.message:String(error)}:{})}}
export async function acpWorkerHealth(){let database=true;try{await getPostgresPool().query("select 1")}catch{database=false}const adapter=await acpAdapterGateway.health();return{state:database&&adapter.state!=="misconfigured"?"healthy":"degraded",database,adapter,lastCycles:state.lastCycles,startedAt:state.startedAt,checkedAt:new Date().toISOString()}}
