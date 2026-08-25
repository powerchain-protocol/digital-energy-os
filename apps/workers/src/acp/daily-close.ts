import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { realtimeEvents } from "@powerchain/database/realtime";
import { acpOperations } from "@powerchain/acp-sdk/operations";
export async function runAcpDailyClose(period=new Date(Date.now()-86400000).toISOString().slice(0,10)){const orgs=await getPostgresPool().query<{organization_id:string}>(`select distinct organization_id from acp_jobs`);const results=[];for(const row of orgs.rows){const result=await acpOperations.dailyClose(row.organization_id,period);results.push(result);await realtimeEvents.append({organizationId:row.organization_id,channel:"acp.operations",event:"powerchain.acp.daily_close.completed.v1",data:result})}return results}
