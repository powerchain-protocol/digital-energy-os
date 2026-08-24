import { commerceError, commerceResponse, getCommerceContext, listMarketplace, requireCommerceAccess } from "@/features/commerce/server";
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context);
    const query=new URL(request.url).searchParams.get("q")??"";
    const data=(await listMarketplace(context,query)).sort((a,b)=>{
      const av=Boolean(a.metadata?.verified)?1:0,bv=Boolean(b.metadata?.verified)?1:0;
      return bv-av||b.remaining-a.remaining;
    }).slice(0,12);
    return commerceResponse(data,context);
  }catch(error){return commerceError(error,context)}
}
