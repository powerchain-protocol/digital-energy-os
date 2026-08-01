import { NextRequest, NextResponse } from "next/server";
import { authenticate, DEMO_ACCOUNTS } from "@/lib/auth/auth";
import { createSession, sessionCookie } from "@/lib/auth/sessions";
import type { AppRole } from "@/types/auth";
const roles: AppRole[] = ["consumer","prosumer","client","company","admin","super-admin"];
export async function GET(){ return NextResponse.json({data:roles.map(role=>({role,email:DEMO_ACCOUNTS[role].email,name:DEMO_ACCOUNTS[role].name}))}); }
export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>({})); const role=roles.includes(body.role)?body.role:"prosumer"; const credentials=DEMO_ACCOUNTS[role];
  const user=await authenticate(credentials); const session=createSession(user); const response=NextResponse.json({data:session}); response.headers.set("Set-Cookie",sessionCookie(session.id)); return response;
}
