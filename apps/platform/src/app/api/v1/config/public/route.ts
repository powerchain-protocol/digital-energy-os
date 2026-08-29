import { getPublicPowerChainConfig } from "@/lib/server/powerchain-api";
export async function GET(){return Response.json({ok:true,data:getPublicPowerChainConfig()},{headers:{"cache-control":"public, max-age=30, stale-while-revalidate=60"}})}
