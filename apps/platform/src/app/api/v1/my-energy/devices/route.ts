import { EnergyMonitoringRepository } from "@powerchain/database/energy-monitoring";
import { withApi,apiJson } from "@/lib/api/with-api";
const repository=new EnergyMonitoringRepository();
function serialize(value:unknown):unknown{if(typeof value==="bigint")return value.toString();if(Array.isArray(value))return value.map(serialize);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([key,item])=>[key,serialize(item)]));return value}
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(serialize({state:repository.mode,devices:await repository.listDevices(context.organizationId!)}),context,{headers:{"cache-control":"no-store"}}))}
