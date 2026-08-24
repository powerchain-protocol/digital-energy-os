import { z } from "zod";
import { commerceError, commerceResponse, createCheckout, getCommerceContext, listCheckouts, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const line=z.object({id:z.string().min(1).max(200),name:z.string().min(1).max(200),quantity:z.number().int().positive().max(1_000_000),unitAmountMinor:z.string().regex(/^\d+$/)});
const schema=z.object({currency:z.enum(["USDC","EURC","PWRC","SOL"]),lines:z.array(line).min(1).max(20),returnUrl:z.string().url().optional()});
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);return commerceResponse(await listCheckouts(context),context)}
  catch(error){return commerceError(error,context)}
}
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);const idempotencyKey=requireCommerceIdempotency(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw Object.assign(new Error("Invalid checkout session"),{code:"CHECKOUT_INPUT_INVALID"});
    return commerceResponse(await createCheckout(context,{...parsed.data,idempotencyKey}),context,{status:201});
  }catch(error){return commerceError(error,context)}
}
