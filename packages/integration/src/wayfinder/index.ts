import type { IntegrationAdapter,IntegrationContext,IntegrationHealth,IntegrationResult } from "../core";
export type WayfinderOperation="route_evaluation"|"research_context"|"health";
export interface WayfinderRequest{operation:WayfinderOperation;payload?:Record<string,unknown>}
export interface WayfinderResponse{provider:"wayfinder";operation:WayfinderOperation;executionAuthority:"POWERCHAIN_ONLY";payload:unknown}
function endpoint(value:string){const url=new URL(value);if(url.protocol!=="https:"&&!['localhost','127.0.0.1','::1'].includes(url.hostname))throw new Error("WAYFINDER_ENDPOINT_REQUIRES_HTTPS");return url.toString().replace(/\/$/,"")}
export class WayfinderAdapter implements IntegrationAdapter<WayfinderRequest,WayfinderResponse>{
 readonly provider="wayfinder";
 constructor(private readonly baseUrl=process.env.WAYFINDER_API_BASE_URL?.trim()||"https://wayfinder.ai/api/v1",private readonly apiKey=process.env.WAYFINDER_API_KEY?.trim()){}
 async execute(request:WayfinderRequest,context:IntegrationContext):Promise<IntegrationResult<WayfinderResponse>>{
  if(!this.apiKey)return{state:"misconfigured",source:this.provider,observedAt:new Date().toISOString(),error:{code:"INVALID_CONFIGURATION",message:"WAYFINDER_API_KEY is not configured",retryable:false}};
  if(!["route_evaluation","research_context","health"].includes(request.operation))return{state:"unavailable",source:this.provider,observedAt:new Date().toISOString(),error:{code:"VALIDATION_FAILED",message:"Unsupported Wayfinder operation",retryable:false}};
  const path=request.operation==="health"?"/health":request.operation==="route_evaluation"?"/paths/evaluate":"/research/context";
  try{const response=await fetch(`${endpoint(this.baseUrl)}${path}`,{method:request.operation==="health"?"GET":"POST",headers:{accept:"application/json",authorization:`Bearer ${this.apiKey}`,...(request.operation!=="health"?{"content-type":"application/json"}:{})},body:request.operation==="health"?undefined:JSON.stringify({...request.payload,powerchainMode:"prepare_only",walletSigning:false}),signal:context.signal,cache:"no-store"});const body=await response.json().catch(()=>null);if(!response.ok)return{state:response.status===429?"degraded":"unavailable",source:this.provider,observedAt:new Date().toISOString(),error:{code:response.status===429?"RATE_LIMITED":"PROVIDER_UNAVAILABLE",message:`Wayfinder returned ${response.status}`,retryable:response.status===429||response.status>=500,providerStatus:response.status}};return{state:"available",source:this.provider,observedAt:new Date().toISOString(),data:{provider:"wayfinder",operation:request.operation,executionAuthority:"POWERCHAIN_ONLY",payload:body}}}catch(error){return{state:context.signal.aborted?"degraded":"unavailable",source:this.provider,observedAt:new Date().toISOString(),error:{code:context.signal.aborted?"TIMEOUT":"PROVIDER_UNAVAILABLE",message:error instanceof Error?error.message:"Wayfinder request failed",retryable:true}}}
 }
 async health():Promise<IntegrationHealth>{return{provider:this.provider,state:this.apiKey?"available":"misconfigured",checkedAt:new Date().toISOString()}}
}
