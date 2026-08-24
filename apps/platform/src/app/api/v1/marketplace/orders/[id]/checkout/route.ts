import { z } from "zod";
import { attachMarketplaceCheckout, commerceError, commerceResponse, getCommerceContext, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const schema=z.object({checkoutSessionId:z.string().min(8).max(200)});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);requireCommerceIdempotency(request);const{id}=await params;
    const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw Object.assign(new Error("checkoutSessionId is required"),{code:"MARKETPLACE_CHECKOUT_INPUT_INVALID"});
    return commerceResponse(await attachMarketplaceCheckout(context,id,parsed.data.checkoutSessionId),context);
  }catch(error){return commerceError(error,context)}
}
