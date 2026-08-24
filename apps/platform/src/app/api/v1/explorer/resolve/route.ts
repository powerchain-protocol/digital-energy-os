import { z } from "zod";
import { commerceError, commerceResponse, getCommerceContext, requireCommerceAccess, resolveExplorer } from "@/features/commerce/server";
const schema=z.object({network:z.enum(["solana-devnet","solana-mainnet-beta","sui-devnet","sui-testnet","sui-mainnet"]),kind:z.enum(["transaction","address","token","program","object"]),identifier:z.string().min(16).max(256)});
export async function POST(request:Request){
  const context=await getCommerceContext(request);
  try{
    requireCommerceAccess(context);
    const parsed=schema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)throw Object.assign(new Error("Invalid explorer request"),{code:"EXPLORER_REQUEST_INVALID"});
    return commerceResponse(resolveExplorer(parsed.data.network,parsed.data.kind,parsed.data.identifier),context);
  }catch(error){return commerceError(error,context)}
}
