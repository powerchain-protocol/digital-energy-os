import { activateMarketplaceListing, commerceError, commerceResponse, getCommerceContext, requireCommerceAccess, requireCommerceIdempotency } from "@/features/commerce/server";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context,true);requireCommerceIdempotency(request);const{id}=await params;return commerceResponse(await activateMarketplaceListing(context,id),context)}
  catch(error){return commerceError(error,context)}
}
