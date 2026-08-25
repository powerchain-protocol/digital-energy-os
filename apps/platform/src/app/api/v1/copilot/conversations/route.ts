import { CopilotRepository } from "@powerchain/database/copilot";
import { withApi,apiJson } from "@/lib/api/with-api";
const repository=new CopilotRepository();
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await repository.listConversations(context.user!.id),context,{headers:{"cache-control":"no-store"}}))}
export async function POST(request:Request){return withApi(request,{auth:"required",json:true,mutation:true},async context=>{const body=(context.body??{}) as Record<string,unknown>;const modelId=typeof body.modelId==="string"&&body.modelId.trim()?body.modelId.trim():"powerchain-copilot";return apiJson(await repository.createConversation(context.user!.id,modelId),context,{status:201})})}
