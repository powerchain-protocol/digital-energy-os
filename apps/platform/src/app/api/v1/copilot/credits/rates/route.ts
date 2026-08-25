import { fetchCopilotCreditRates } from "@powerchain/credits/fetch-credits";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await fetchCopilotCreditRates(),context,{headers:{"cache-control":"no-store"}}))}
