import { NextResponse } from "next/server";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    database: Boolean(env.DATABASE_URL),
    supabase: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    rpc: Boolean(env.SOLANA_RPC_URL),
    email: Boolean(env.RESEND_API_KEY),
  };

  const configured = Object.values(checks).filter(Boolean).length;
  return NextResponse.json({
    ready: true,
    mode: configured === 0 ? "demo" : "integrated",
    configuredServices: configured,
    checks,
    timestamp: new Date().toISOString(),
  });
}
