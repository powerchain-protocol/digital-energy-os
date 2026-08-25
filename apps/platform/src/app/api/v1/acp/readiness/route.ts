import { acpOperations } from "@powerchain/acp-sdk/operations";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"optional"},async context=>{const data=await acpOperations.readiness();return apiJson(data,context,{status:data.ready?200:503,headers:{"cache-control":"no-store"}})})}
