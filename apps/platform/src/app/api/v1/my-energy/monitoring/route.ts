import { EnergyMonitoringRepository } from "@powerchain/database/energy-monitoring";
import { withApi,apiJson } from "@/lib/api/with-api";
const repository=new EnergyMonitoringRepository();
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>{const url=new URL(request.url);const deviceId=url.searchParams.get("deviceId")??undefined;const limit=Number(url.searchParams.get("limit")??200);return apiJson({state:repository.mode,readings:await repository.telemetry(context.organizationId!,deviceId,Number.isFinite(limit)?limit:200)},context,{headers:{"cache-control":"no-store"}})})}
