import { ApplicationError,createApplication,json,readJson } from "@powerchain/application-runtime";
import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { acpWorkerHealth } from "./acp/health";
import { runAcpReconciliationCycle } from "./acp/reconciliation";
import { runAcpDailyClose } from "./acp/daily-close";
import { runAcpOutboxCycle } from "./acp/outbox";
import { runAcpEventProcessingCycle } from "./acp/event-processing";

export const applicationName="workers" as const;
function authorize(request:Request){const expected=process.env.POWERCHAIN_WORKER_ADMIN_TOKEN?.trim();if(!expected&&process.env.NODE_ENV!=="production")return;const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!expected||supplied!==expected)throw new ApplicationError("UNAUTHORIZED","Worker administrative token is required",401)}
async function stats(){const result=await getPostgresPool().query<{pending_outbox:string;pending_inbox:string;unknown_executions:string;open_incidents:string}>(`select (select count(*) from acp_outbox where state='pending')::text pending_outbox,(select count(*) from acp_event_inbox where processed_at is null)::text pending_inbox,(select count(*) from acp_execution_attempts where status='unknown')::text unknown_executions,(select count(*) from acp_incidents where status<>'resolved')::text open_incidents`);const row=result.rows[0]!;return{persistent:true,acp:{pendingOutbox:Number(row.pending_outbox),pendingInbox:Number(row.pending_inbox),unknownExecutions:Number(row.unknown_executions),openIncidents:Number(row.open_incidents)},health:await acpWorkerHealth()}}
export const application=createApplication({manifest:{id:applicationName,name:"PowerChain Workers",version:"1.0.0",description:"Durable ACP, reconciliation, settlement and outbox worker boundary.",basePath:"/api/v1/jobs",capabilities:["durable-inbox","transactional-outbox","reconciliation","daily-close","leases"]},readiness:async()=>{try{await getPostgresPool().query("select 1");return true}catch{return false}},routes:[
  {method:"GET",path:"/api/v1/jobs/stats",summary:"Return durable worker state",handler:async()=>json(await stats())},
  {method:"GET",path:"/api/v1/jobs/health",summary:"Return ACP worker health",handler:async()=>json(await acpWorkerHealth())},
  {method:"POST",path:"/api/v1/jobs/acp/reconcile",summary:"Run an authorized ACP reconciliation cycle",async handler(request){authorize(request);return json(await runAcpReconciliationCycle())}},
  {method:"POST",path:"/api/v1/jobs/acp/outbox",summary:"Run an authorized ACP outbox cycle",async handler(request){authorize(request);return json(await runAcpOutboxCycle(`manual-${crypto.randomUUID().slice(0,8)}`))}},
  {method:"POST",path:"/api/v1/jobs/acp/events",summary:"Run an authorized ACP event processing cycle",async handler(request){authorize(request);return json(await runAcpEventProcessingCycle(`manual-${crypto.randomUUID().slice(0,8)}`))}},
  {method:"POST",path:"/api/v1/jobs/acp/daily-close",summary:"Run an authorized ACP Daily Close",async handler(request){authorize(request);const body=await readJson<{period?:string}>(request);return json(await runAcpDailyClose(body.period))}},
]});
