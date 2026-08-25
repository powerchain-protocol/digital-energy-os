import { withApi, apiJson } from "@/lib/api/with-api";
import { OperatorWorkspaceRepository } from "@powerchain/database/operator-workspaces";

const repository=new OperatorWorkspaceRepository();
export async function GET(request:Request){
  return withApi(request,{auth:"required"},async context=>apiJson(await repository.overview(context.organizationId!,"treasury"),context));
}
