import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params;return withApi(request,{auth:"required"},async context=>{const job=await acpKernel.job(context.organizationId!,id);if(!job)throw new ApiError("ACP_JOB_NOT_FOUND","ACP job was not found",404);return apiJson(job,context,{headers:{"cache-control":"no-store"}})})}
