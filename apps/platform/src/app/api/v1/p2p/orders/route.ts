import { NextResponse } from "next/server";
import { z } from "zod";
import { demoP2POrders, localEnergyListings } from "@/data/p2p-energy";
import { calculateTradeTotal, validateP2PQuantity } from "@/lib/p2p";
import { isSolanaAddress } from "@/types/validate";

const schema=z.object({listingId:z.string().min(3),buyerId:z.string().min(3),quantityKwh:z.number().positive().max(100000),walletAddress:z.string().optional()});

export async function GET(){return NextResponse.json({data:demoP2POrders});}

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid P2P order",details:parsed.error.flatten()},{status:400});
  const listing=localEnergyListings.find(x=>x.id===parsed.data.listingId&&x.status==="active");
  if(!listing)return NextResponse.json({error:"Listing is unavailable"},{status:404});
  const quantityError=validateP2PQuantity(parsed.data.quantityKwh,listing.minimumKwh,listing.availableKwh);
  if(quantityError)return NextResponse.json({error:quantityError},{status:409});
  if(parsed.data.walletAddress&&!isSolanaAddress(parsed.data.walletAddress))return NextResponse.json({error:"A valid Solana wallet address is required"},{status:400});
  const pricing=calculateTradeTotal(parsed.data.quantityKwh,listing.pricePerKwh);
  return NextResponse.json({order:{id:`p2p_${crypto.randomUUID()}`,listingId:listing.id,buyerId:parsed.data.buyerId,quantityKwh:parsed.data.quantityKwh,currency:listing.currency,settlementAsset:listing.settlementAsset,status:"requires_signature",pricing,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+15*60_000).toISOString()}},{status:201});
}
