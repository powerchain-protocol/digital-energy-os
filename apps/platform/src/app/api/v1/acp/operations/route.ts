import { acpOperations } from "@powerchain/acp-sdk/operations";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await acpOperations.scorecard(context.organizationId!),context,{headers:{"cache-control":"no-store"}}))}
