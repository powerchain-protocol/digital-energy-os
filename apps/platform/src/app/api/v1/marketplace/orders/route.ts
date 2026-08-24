import { z } from "zod";
import { commerceError, commerceResponse, getCommerceContext, listMarketplaceOrders, requireCommerceAccess, requireCommerceIdempotency, reserveMarketplace } from "@/features/commerce/server";
const schema=z.object({listingId:z.string().min(3).max(200),quantity:z.number().int().positive().max(1_000_000)});
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);return commerceResponse(await listMarketplaceOrders(context),context)}
  catch(error){return commerceError(error,context)}
}
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);const idempotencyKey=requireCommerceIdempotency(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw Object.assign(new Error("Invalid marketplace order"),{code:"MARKETPLACE_ORDER_INPUT_INVALID"});
    return commerceResponse(await reserveMarketplace(context,{...parsed.data,idempotencyKey}),context,{status:201});
  }catch(error){return commerceError(error,context)}
}
