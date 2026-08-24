import { z } from "zod";
import { commerceError, commerceResponse, createCheckout, getCommerceContext, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const schema=z.object({asset:z.enum(["SOL","USDC","EURC","PWRC"]),amount:z.number().positive(),recipient:z.string().optional(),wallet:z.string().optional()});
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);const idempotencyKey=requireCommerceIdempotency(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw Object.assign(new Error("Invalid payment"),{code:"CHECKOUT_INPUT_INVALID"});
    const minor=BigInt(Math.round(parsed.data.amount*1_000_000)).toString();
    const data=await createCheckout(context,{currency:parsed.data.asset,lines:[{id:"payment",name:"PowerChain checkout",quantity:1,unitAmountMinor:minor}],idempotencyKey});
    return commerceResponse(data,context,{status:201});
  }catch(error){return commerceError(error,context)}
}
