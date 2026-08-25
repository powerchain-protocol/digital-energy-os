import { CopilotRepository } from "@powerchain/database/copilot";
import { withApi,apiJson } from "@/lib/api/with-api";
const repository=new CopilotRepository();
export async function DELETE(request:Request,{params}:{params:Promise<{prompt_id:string}>}){return withApi(request,{auth:"required",mutation:true},async context=>{const{prompt_id}=await params;await repository.removePrompt(context.user!.id,prompt_id);return apiJson({promptId:prompt_id,removed:true},context)})}
