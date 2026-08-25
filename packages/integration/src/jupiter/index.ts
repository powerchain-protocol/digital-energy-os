import "server-only";
import { createJupiterApiClient } from "@jup-ag/api";
export const JUPITER_CLIENT_VERSION="6.0.44" as const;
export const JUPITER_API_BASE_URL="https://api.jup.ag" as const;
export const JUPITER_TOKEN_API_V2="https://api.jup.ag/tokens/v2" as const;
export const WRAPPED_SOL_MINT="So11111111111111111111111111111111111111112" as const;
export const USDC_MAINNET_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;
function headers(){return process.env.JUPITER_API_KEY?{"x-api-key":process.env.JUPITER_API_KEY}:{} }
export function createPowerChainJupiterClient(){return createJupiterApiClient({basePath:process.env.JUPITER_SWAP_API_BASE_URL??JUPITER_API_BASE_URL,apiKey:process.env.JUPITER_API_KEY})}
export async function searchJupiterTokens(query:string){const q=query.trim();if(!q)return[];const url=new URL(`${process.env.JUPITER_TOKEN_API_BASE_URL??JUPITER_TOKEN_API_V2}/search`);url.searchParams.set("query",q);const r=await fetch(url,{headers:headers(),cache:"no-store",signal:AbortSignal.timeout(5000)});if(!r.ok)throw Object.assign(new Error(`Jupiter token search failed: ${r.status}`),{code:"JUPITER_TOKEN_SEARCH_FAILED"});return await r.json() as unknown[]}
export async function quoteJupiterSwap(input:{inputMint:string;outputMint:string;amountRaw:string;slippageBps?:number}){const api=createPowerChainJupiterClient();return api.quoteGet({inputMint:input.inputMint,outputMint:input.outputMint,amount:input.amountRaw,slippageBps:input.slippageBps??50})}
