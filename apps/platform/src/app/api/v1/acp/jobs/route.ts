import { acpKernel } from "@powerchain/acp-sdk/kernel";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>{const states=new URL(request.url).searchParams.get("state")?.split(",").map(v=>v.trim()).filter(Boolean);return apiJson(await acpKernel.jobs(context.organizationId!,states),context,{headers:{"cache-control":"no-store"}})})}
