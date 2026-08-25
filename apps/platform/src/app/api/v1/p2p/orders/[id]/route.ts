import { NextResponse } from "next/server";
import { z } from "zod";
import { demoP2POrders } from "@/data/p2p-energy";

const updateSchema=z.object({status:z.enum(["escrowed","metering","settled","cancelled"]),signature:z.string().min(8).optional(),meterReadingId:z.string().min(3).optional()});

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const order=demoP2POrders.find(item=>item.id===id);
  if(!order)return NextResponse.json({error:"Order not found"},{status:404});
  return NextResponse.json({data:order});
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const parsed=updateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid order update",details:parsed.error.flatten()},{status:400});
  return NextResponse.json({data:{id,...parsed.data,updatedAt:new Date().toISOString()}});
}
