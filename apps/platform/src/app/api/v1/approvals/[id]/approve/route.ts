import { approvalService } from "@powerchain/approvals";
import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
import { commandFromContext } from "@/lib/acp/commands";

function assertReviewer(role:string){
  if(!["company","admin","super-admin"].includes(role))throw new ApiError("APPROVAL_FORBIDDEN","This role cannot approve consequential actions",403);
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  return withApi(request,{auth:"required",mutation:true,idempotency:true},async context=>{
    assertReviewer(context.user!.role);
    const approval=await approvalService.decide({organizationId:context.organizationId!,approvalId:id,actorId:context.user!.id,decision:"approved"});
    let commandReceipt:unknown=null;
    if(approval.resourceType==="proposal"&&approval.action==="create_job"){
      commandReceipt=await acpKernel.dispatch(commandFromContext(context,"acp.job.create",{proposalId:approval.resourceId,approvalId:approval.id},context.idempotencyKey));
    }else if(approval.resourceType==="job"&&approval.jobId&&approval.action==="fund_job"){
      commandReceipt=await acpKernel.dispatch(commandFromContext(context,"acp.job.approve_funding",{jobId:approval.jobId,approvalId:approval.id},context.idempotencyKey));
    }else if(approval.resourceType==="job"&&approval.jobId&&approval.action==="complete_job"){
      commandReceipt=await acpKernel.dispatch(commandFromContext(context,"acp.job.complete",{jobId:approval.jobId,approvalId:approval.id},context.idempotencyKey));
    }
    return apiJson({approval,commandReceipt},context,{status:202,headers:{"cache-control":"no-store"}});
  });
}
