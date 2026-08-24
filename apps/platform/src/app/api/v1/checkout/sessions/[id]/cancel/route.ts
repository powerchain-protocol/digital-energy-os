import { z } from "zod";
import { checkoutAction, commerceError, commerceResponse, getCommerceContext, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const schema=z.object({payerWallet:z.string().max(256).optional(),signature:z.string().max(256).optional()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);requireCommerceIdempotency(request);const{id}=await params;
    const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)throw Object.assign(new Error("Invalid checkout action payload"),{code:"CHECKOUT_ACTION_INPUT_INVALID"});
    return commerceResponse(await checkoutAction(context,id,"cancel",parsed.data),context);
  }catch(error){return commerceError(error,context)}
}
