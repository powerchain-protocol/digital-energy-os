import { NextResponse } from "next/server";
import { PLATFORM_LAYERS, summarizePlatformCatalog } from "@/data/platform";

export async function GET() {
  return NextResponse.json({
    data: PLATFORM_LAYERS,
    summary: summarizePlatformCatalog(),
    meta: { version: "1.0.0-beta.19.2", generatedAt: new Date().toISOString() },
  });
}
