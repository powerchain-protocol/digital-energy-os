import { commerceError, commerceResponse, getCommerceContext, listExplorerNetworks, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{requireCommerceAccess(context);return commerceResponse(listExplorerNetworks(),context)}
  catch(error){return commerceError(error,context)}
}
