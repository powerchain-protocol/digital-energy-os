import { acpRepositories } from "@powerchain/database/acp";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";

function assertReviewer(role:string){
  if(!["company","admin","super-admin"].includes(role))throw new ApiError("APPROVAL_FORBIDDEN","This role cannot review consequential approvals",403);
}

export async function GET(request:Request){
  return withApi(request,{auth:"required"},async context=>{
    assertReviewer(context.user!.role);
    const url=new URL(request.url);
    const state=url.searchParams.get("state");
    const approvals=state==="pending"
      ?await acpRepositories.approvals.pending({organizationId:context.organizationId!},200)
      :await acpRepositories.approvals.list({organizationId:context.organizationId!},200);
    return apiJson(approvals,context,{headers:{"cache-control":"no-store"}});
  });
}
