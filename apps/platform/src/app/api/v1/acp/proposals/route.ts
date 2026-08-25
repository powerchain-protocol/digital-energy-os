import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson } from "@/lib/api/with-api";
import { commandFromContext } from "@/lib/acp/commands";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await acpKernel.proposals(context.organizationId!),context,{headers:{"cache-control":"no-store"}}))}
export async function POST(request:Request){return withApi<Record<string,unknown>>(request,{auth:"required",json:true,mutation:true,idempotency:true},async context=>apiJson(await acpKernel.dispatch(commandFromContext(context,"acp.proposal.create",context.body,context.idempotencyKey)),context,{status:202,headers:{"cache-control":"no-store"}}))}
