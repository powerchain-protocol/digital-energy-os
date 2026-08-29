import { getSolanaOverview } from "@/lib/server/powerchain-api";
export async function GET(){return Response.json({ok:true,data:await getSolanaOverview(),meta:{canonical:"/api/v1/solana/overview",deprecated:false}},{headers:{"x-powerchain-api-origin":"nextjs-server-proxy","cache-control":"public, max-age=10, stale-while-revalidate=20"}})}
