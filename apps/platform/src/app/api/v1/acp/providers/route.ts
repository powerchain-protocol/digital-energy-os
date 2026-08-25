import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
import { commandFromContext } from "@/lib/acp/commands";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>{const url=new URL(request.url),capabilityId=url.searchParams.get("capability")?.trim(),query=url.searchParams.get("q")?.trim();if(!capabilityId)throw new ApiError("ACP_VALIDATION_ERROR","capability query parameter is required",400);const data=await acpKernel.dispatch(commandFromContext(context,"acp.provider.search",{capabilityId,query:query||capabilityId,topK:Number(url.searchParams.get("limit")??10)}));return apiJson(data,context,{headers:{"cache-control":"no-store"}})})}
