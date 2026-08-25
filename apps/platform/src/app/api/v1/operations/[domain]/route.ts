import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
import { OperatorWorkspaceRepository,type OperatorWorkspaceDomain } from "@powerchain/database/operator-workspaces";
const repository=new OperatorWorkspaceRepository();
const domains=new Set<OperatorWorkspaceDomain>(["ems","erp","cmr","rewards","treasury","vault"]);
export async function GET(request:Request,{params}:{params:Promise<{domain:string}>}){return withApi(request,{auth:"required"},async context=>{const{domain}=await params;if(!domains.has(domain as OperatorWorkspaceDomain))throw new ApiError("OPERATOR_DOMAIN_NOT_FOUND","Unknown operator workspace",404);return apiJson(await repository.overview(context.organizationId!,domain as OperatorWorkspaceDomain),context,{headers:{"cache-control":"no-store"}})})}
