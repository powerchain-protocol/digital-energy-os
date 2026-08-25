import { createJupiterApiClient } from "@jup-ag/api";
import { JUPITER_API,SOLANA_MINTS } from "@powerchain/token-framework";
import type { IntegrationAdapter,IntegrationContext } from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";

export type JupiterOperation="searchTokens"|"verifiedTokens"|"recentTokens"|"price"|"quote";
export interface JupiterAdapterRequest{operation:JupiterOperation;payload?:Record<string,unknown>}
export interface JupiterTokenInfo{id:string;name?:string;symbol?:string;icon?:string;decimals?:number;isVerified?:boolean;organicScore?:number;organicScoreLabel?:string;usdPrice?:number;holderCount?:number;tags?:string[]}
export interface JupiterAdapterResponse{provider:"jupiter";operation:JupiterOperation;payload:unknown}
export interface JupiterAdapterOptions{apiKey?:string;baseUrl?:string}
function resultError(code:string,message:string,retryable=false,status?:number):IntegrationResult<JupiterAdapterResponse>{return{state:status===429?"degraded":"unavailable",source:"jupiter",observedAt:new Date().toISOString(),error:{code:code as any,message,retryable,...(status?{providerStatus:status}:{})}}}

export class JupiterAdapter implements IntegrationAdapter<JupiterAdapterRequest,JupiterAdapterResponse>{
 readonly provider="jupiter";
 private readonly base:string;
 private readonly client:ReturnType<typeof createJupiterApiClient>;
 constructor(private readonly options:JupiterAdapterOptions={}){this.base=(options.baseUrl??JUPITER_API.base).replace(/\/$/,'');this.client=createJupiterApiClient(options.apiKey?{apiKey:options.apiKey}:{})}
 private headers(context:IntegrationContext){return{"x-request-id":context.requestId,...(this.options.apiKey?{"x-api-key":this.options.apiKey}:{})}}
 private async get(path:string,context:IntegrationContext){const response=await fetch(`${this.base}${path}`,{headers:this.headers(context),signal:context.signal,cache:"no-store"});if(!response.ok)throw Object.assign(new Error(`Jupiter request failed (${response.status})`),{status:response.status});return response.json()}
 async execute(request:JupiterAdapterRequest,context:IntegrationContext):Promise<IntegrationResult<JupiterAdapterResponse>>{
  try{
   let payload:unknown;
   switch(request.operation){
    case "searchTokens":{const query=String(request.payload?.query??'').trim();if(!query)return resultError("VALIDATION_FAILED","Token query is required");payload=await this.get(`${JUPITER_API.tokenSearch}?query=${encodeURIComponent(query)}`,context);break}
    case "verifiedTokens":payload=await this.get(`${JUPITER_API.tokenTag}?query=verified`,context);break;
    case "recentTokens":payload=await this.get(JUPITER_API.tokenRecent,context);break;
    case "price":{const ids=Array.isArray(request.payload?.ids)?request.payload!.ids.filter((v):v is string=>typeof v==='string'&&v.length>0):[String(request.payload?.id??SOLANA_MINTS.wrappedSol)];if(!ids.length)return resultError("VALIDATION_FAILED","At least one token mint is required");payload=await this.get(`${JUPITER_API.priceV3}?ids=${encodeURIComponent(ids.join(','))}`,context);break}
    case "quote":{const inputMint=String(request.payload?.inputMint??'').trim();const outputMint=String(request.payload?.outputMint??'').trim();const amount=String(request.payload?.amount??'').trim();if(!inputMint||!outputMint||!/^\d+$/.test(amount))return resultError("VALIDATION_FAILED","quote requires inputMint, outputMint and integer raw amount");payload=await this.client.quoteGet({inputMint,outputMint,amount,slippageBps:Number(request.payload?.slippageBps??50)});break}
    default:return resultError("VALIDATION_FAILED","Unsupported Jupiter operation");
   }
   return{state:"available",source:this.provider,observedAt:new Date().toISOString(),data:{provider:"jupiter",operation:request.operation,payload}};
  }catch(error){const status=typeof error==='object'&&error&&'status'in error?Number((error as any).status):undefined;return resultError(status===429?"RATE_LIMITED":"PROVIDER_UNAVAILABLE",error instanceof Error?error.message:"Jupiter request failed",true,status)}
 }
 async health():Promise<IntegrationHealth>{return{provider:this.provider,state:"available",checkedAt:new Date().toISOString()}}
}
