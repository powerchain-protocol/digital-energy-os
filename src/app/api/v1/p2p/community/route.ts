import { NextResponse } from "next/server";
import { demoP2POrders, energyCommunitySummary } from "@/data/p2p-energy";

export async function GET(){
  return NextResponse.json({data:{summary:energyCommunitySummary,recentOrders:demoP2POrders,updatedAt:new Date().toISOString()}});
}
