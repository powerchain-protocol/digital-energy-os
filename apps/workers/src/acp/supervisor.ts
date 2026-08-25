import { runAcpOutboxCycle } from "./outbox";
import { resolveOrphanEvents,runAcpEventProcessingCycle } from "./event-processing";
import { runAcpReconciliationCycle } from "./reconciliation";
import { runAcpReservationCycle } from "./reservations";
import { runAcpDailyClose } from "./daily-close";
import { recordCycle } from "./health";

export function startAcpWorkerSupervisor(){const workerId=`acp-worker-${process.pid}-${crypto.randomUUID().slice(0,8)}`;const timers=new Set<ReturnType<typeof setInterval>>();let stopped=false;const run=async(name:string,fn:()=>Promise<unknown>)=>{if(stopped)return;try{const result=await fn();recordCycle(name,result)}catch(error){recordCycle(name,{failed:true},error)}};const every=(name:string,ms:number,fn:()=>Promise<unknown>)=>{void run(name,fn);const timer=setInterval(()=>void run(name,fn),ms);timer.unref?.();timers.add(timer)};every("acp.outbox",1000,()=>runAcpOutboxCycle(workerId));every("acp.events",1000,()=>runAcpEventProcessingCycle(workerId));every("acp.orphans",15000,()=>resolveOrphanEvents());every("acp.reconciliation",30000,()=>runAcpReconciliationCycle());every("acp.reservations",60000,()=>runAcpReservationCycle());every("acp.daily-close",15*60*1000,async()=>{const now=new Date();return now.getUTCHours()===0?runAcpDailyClose():{skipped:true,reason:"outside_close_window"}});return{workerId,stop(){stopped=true;for(const timer of timers)clearInterval(timer);timers.clear()}}}
