import { COPILOT_PROMPT_LIBRARY } from "@/backend/copilot_prompts";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(COPILOT_PROMPT_LIBRARY,context,{headers:{"cache-control":"private, max-age=300"}}))}
