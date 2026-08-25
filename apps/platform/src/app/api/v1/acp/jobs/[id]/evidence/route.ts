import { evidenceVault } from "@powerchain/evidence";import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params;return withApi(request,{auth:"required"},async context=>apiJson(await evidenceVault.list(context.organizationId!,id),context,{headers:{"cache-control":"no-store"}}))}
