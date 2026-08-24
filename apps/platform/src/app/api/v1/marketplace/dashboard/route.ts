import { commerceError, commerceResponse, getCommerceContext, listMarketplace, listMarketplaceOrders, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context);
    const[listings,orders]=await Promise.all([listMarketplace(context),listMarketplaceOrders(context)]);
    const activeOrders=orders.filter(order=>!["paid","cancelled","expired"].includes(order.status)).length;
    const paidOrders=orders.filter(order=>order.status==="paid").length;
    return commerceResponse({activeListings:listings.length,activeOrders,paidOrders,remainingInventory:listings.reduce((sum,item)=>sum+item.remaining,0),currencies:[...new Set(listings.map(item=>item.currency))]},context);
  }catch(error){return commerceError(error,context)}
}
