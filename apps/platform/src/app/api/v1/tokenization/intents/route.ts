import { z } from "zod";
import { commerceError, commerceResponse, createTokenization, getCommerceContext, listTokenization, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const schema=z.object({energyPositionId:z.string().min(3).max(200),network:z.enum(["SOLANA","SUI"]),amountWh:z.string().regex(/^\d+$/)});
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);return commerceResponse(await listTokenization(context),context)}
  catch(error){return commerceError(error,context)}
}
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);const idempotencyKey=requireCommerceIdempotency(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)throw Object.assign(new Error("Invalid tokenization intent"),{code:"TOKENIZATION_INPUT_INVALID"});
    return commerceResponse(await createTokenization(context,{...parsed.data,amountWh:BigInt(parsed.data.amountWh),idempotencyKey}),context,{status:201});
  }catch(error){return commerceError(error,context)}
}
