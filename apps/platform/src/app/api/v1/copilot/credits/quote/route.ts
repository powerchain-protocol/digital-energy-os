import { withApi,apiJson,ApiError } from "@/lib/api/with-api";
import { getCopilotCreditQuote } from "@/lib/ai/billing/pricing";
import type { CopilotDisplayCurrency } from "@powerchain/credits";
const CURRENCIES=new Set<CopilotDisplayCurrency>(["USD","EUR","SOL","PWRC"]);
export async function POST(request:Request){return withApi(request,{auth:"required",json:true},async context=>{const body=context.body as Record<string,unknown>;const pricingClass=body.pricingClass==="REAL_DATA"?"REAL_DATA":body.pricingClass==="BASE"?"BASE":null;if(!pricingClass)throw new ApiError("COPILOT_PRICING_CLASS_INVALID","pricingClass must be BASE or REAL_DATA",422);const currency=typeof body.currency==="string"&&CURRENCIES.has(body.currency as CopilotDisplayCurrency)?body.currency as CopilotDisplayCurrency:"USD";return apiJson(await getCopilotCreditQuote(pricingClass,currency),context,{headers:{"cache-control":"no-store"}})})}
