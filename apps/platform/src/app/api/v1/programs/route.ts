import { getPowerChainPrograms } from "@/lib/server/powerchain-api";
export async function GET(){return Response.json({ok:true,data:await getPowerChainPrograms()},{headers:{"cache-control":"public, max-age=30, stale-while-revalidate=60","x-powerchain-api-origin":"nextjs-server-proxy"}})}
