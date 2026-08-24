import { z } from "zod";
import { commerceError, commerceResponse, getCommerceContext, requireCommerceAccess, requireCommerceIdempotency, tokenizationAction } from "@/features/commerce/server";
const schema=z.object({walletReference:z.string().max(256).optional(),chainReference:z.string().max(256).optional()});
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);requireCommerceIdempotency(request);const{id}=await params;
    const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)throw Object.assign(new Error("Invalid tokenization action payload"),{code:"TOKENIZATION_ACTION_INPUT_INVALID"});
    return commerceResponse(await tokenizationAction(context,id,"SUBMITTED",parsed.data),context);
  }catch(error){return commerceError(error,context)}
}
