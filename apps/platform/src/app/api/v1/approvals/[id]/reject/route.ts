import { approvalService } from "@powerchain/approvals";
import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";

function assertReviewer(role:string){
  if(!["company","admin","super-admin"].includes(role))throw new ApiError("APPROVAL_FORBIDDEN","This role cannot reject consequential approvals",403);
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  return withApi(request,{auth:"required",mutation:true,idempotency:true},async context=>{
    assertReviewer(context.user!.role);
    const approval=await approvalService.decide({organizationId:context.organizationId!,approvalId:id,actorId:context.user!.id,decision:"rejected"});
    await acpKernel.recordApprovalRejection({organizationId:context.organizationId!,approval,actorId:context.user!.id,requestId:context.requestId,traceId:context.traceId,correlationId:context.correlationId});
    return apiJson({approval,state:"rejected"},context,{status:200,headers:{"cache-control":"no-store"}});
  });
}
