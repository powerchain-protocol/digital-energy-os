import { commerceError, commerceResponse, getCommerceContext, getMarketplaceOrder, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);const{id}=await params;const data=await getMarketplaceOrder(context,id);if(!data)throw Object.assign(new Error("Marketplace order not found"),{code:"MARKETPLACE_ORDER_NOT_FOUND"});return commerceResponse(data,context)}
  catch(error){return commerceError(error,context)}
}
