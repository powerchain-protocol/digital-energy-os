import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await acpKernel.approvals(context.organizationId!),context,{headers:{"cache-control":"no-store"}}))}
