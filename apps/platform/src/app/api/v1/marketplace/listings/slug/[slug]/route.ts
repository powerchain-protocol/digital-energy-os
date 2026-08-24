import { commerceError, commerceResponse, getCommerceContext, getMarketplaceListingBySlug, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);const{slug}=await params;const data=await getMarketplaceListingBySlug(context,slug);if(!data)throw Object.assign(new Error("Marketplace listing not found"),{code:"MARKETPLACE_LISTING_NOT_FOUND"});return commerceResponse(data,context)}
  catch(error){return commerceError(error,context)}
}
