import { commerceDatabaseConfigured, commerceResponse, getCommerceContext } from "@/features/commerce/server";
export async function GET(request:Request){
  const context=await getCommerceContext(request);
  return commerceResponse({service:"checkout",version:"1.0.0",database:commerceDatabaseConfigured()?"CONFIGURED":"DEMO",walletSigning:"external-only"},context);
}
