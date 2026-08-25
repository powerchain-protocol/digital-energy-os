import { acpOperations } from "@powerchain/acp-sdk/operations";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"optional"},context=>apiJson(acpOperations.compatibility(),context,{headers:{"cache-control":"no-store"}}))}
