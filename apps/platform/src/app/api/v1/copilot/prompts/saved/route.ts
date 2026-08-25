import { CopilotRepository } from "@powerchain/database/copilot";
import { findPrompt } from "@/backend/copilot_prompts";
import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
const repository=new CopilotRepository();
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await repository.savedPrompts(context.user!.id),context))}
export async function POST(request:Request){return withApi(request,{auth:"required",json:true,mutation:true},async context=>{const body=context.body as Record<string,unknown>;const promptId=typeof body.promptId==="string"?body.promptId.trim():"";if(!promptId||!findPrompt(promptId))throw new ApiError("COPILOT_PROMPT_NOT_FOUND","Prompt does not exist",404);return apiJson(await repository.savePrompt(context.user!.id,promptId),context,{status:201})})}
