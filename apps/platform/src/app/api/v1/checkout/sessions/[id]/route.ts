import { commerceError, commerceResponse, getCheckout, getCommerceContext, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);const{id}=await params;const data=await getCheckout(context,id);if(!data)throw Object.assign(new Error("Checkout session not found"),{code:"CHECKOUT_SESSION_NOT_FOUND"});return commerceResponse(data,context)}
  catch(error){return commerceError(error,context)}
}
