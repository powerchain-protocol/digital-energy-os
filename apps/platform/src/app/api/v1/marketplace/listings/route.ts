import { z } from "zod";
import { activateMarketplaceListing, commerceError, commerceResponse, createMarketplaceListing, getCommerceContext, listMarketplace, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
const schema=z.object({title:z.string().min(3).max(160),description:z.string().min(3).max(2000),category:z.string().min(2).max(80),source:z.string().max(80).optional(),location:z.string().max(160).optional(),currency:z.enum(["USDC","EURC","PWRC","SOL"]),unitAmountMinor:z.string().regex(/^\d+$/),inventory:z.number().int().positive().max(1_000_000),slug:z.string().max(100).optional()});
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);return commerceResponse(await listMarketplace(context,new URL(request.url).searchParams.get("q")??""),context)}
  catch(error){return commerceError(error,context)}
}
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context,true);requireCommerceIdempotency(request);
    const parsed=schema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)throw Object.assign(new Error("Invalid marketplace listing"),{code:"MARKETPLACE_LISTING_INPUT_INVALID"});
    return commerceResponse(await createMarketplaceListing(context,parsed.data),context,{status:201});
  }catch(error){return commerceError(error,context)}
}
