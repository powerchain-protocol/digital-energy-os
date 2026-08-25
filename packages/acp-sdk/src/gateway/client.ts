import { createHmac } from "node:crypto";
import type { AgentCommerceAdapter,AuthorizedCompletion,AuthorizedCreateJob,AuthorizedFunding,AuthorizedRejection,DiscoverProvidersInput,ExternalJobLookup } from "@powerchain/acp-contracts";

function endpoint(){const raw=process.env.POWERCHAIN_ACP_ADAPTER_URL?.trim();if(!raw)throw Object.assign(new Error("POWERCHAIN_ACP_ADAPTER_URL is not configured"),{code:"ACP_ADAPTER_UNAVAILABLE"});const url=new URL(raw);if(url.protocol!=="https:"&&!['localhost','127.0.0.1','::1'].includes(url.hostname))throw new Error("ACP_ADAPTER_URL_REQUIRES_HTTPS");return url.toString().replace(/\/$/,"")}
function secret(){const value=process.env.POWERCHAIN_INTERNAL_SERVICE_SECRET?.trim();if(!value)throw Object.assign(new Error("POWERCHAIN_INTERNAL_SERVICE_SECRET is not configured"),{code:"ACP_INTERNAL_AUTH_UNCONFIGURED"});return value}
async function invoke<T>(path:string,body:unknown,timeoutMs=15_000):Promise<T>{const payload=JSON.stringify(body);const signature=createHmac("sha256",secret()).update(payload).digest("hex");const response=await fetch(`${endpoint()}${path}`,{method:"POST",headers:{"content-type":"application/json","x-powerchain-internal-signature":signature},body:payload,signal:AbortSignal.timeout(timeoutMs)});const result=await response.json().catch(()=>null) as{data?:T;error?:{message?:string;code?:string}}|null;if(!response.ok)throw Object.assign(new Error(result?.error?.message??`ACP adapter gateway returned ${response.status}`),{code:result?.error?.code??"ACP_ADAPTER_GATEWAY_ERROR"});return result?.data as T}
export class AcpAdapterGatewayClient implements AgentCommerceAdapter{
  readonly version="1.0.0" as const;readonly protocolVersion="1.0.0" as const;
  async start(){}async stop(){}
  discoverProviders(input:DiscoverProvidersInput){return invoke<Awaited<ReturnType<AgentCommerceAdapter["discoverProviders"]>>>("/internal/acp/providers/discover",input)}
  createJob(input:AuthorizedCreateJob){return invoke<Awaited<ReturnType<AgentCommerceAdapter["createJob"]>>>("/internal/acp/jobs/create",input,30_000)}
  fundJob(input:AuthorizedFunding){return invoke<Awaited<ReturnType<AgentCommerceAdapter["fundJob"]>>>("/internal/acp/jobs/fund",input,45_000)}
  completeJob(input:AuthorizedCompletion){return invoke<Awaited<ReturnType<AgentCommerceAdapter["completeJob"]>>>("/internal/acp/jobs/complete",input,30_000)}
  rejectJob(input:AuthorizedRejection){return invoke<Awaited<ReturnType<AgentCommerceAdapter["rejectJob"]>>>("/internal/acp/jobs/reject",input,30_000)}
  getJob(input:ExternalJobLookup){return invoke<Awaited<ReturnType<AgentCommerceAdapter["getJob"]>>>("/internal/acp/jobs/get",input)}
  async health(){try{const response=await fetch(`${endpoint()}/health/ready`,{headers:{"x-powerchain-service-probe":"acp-sdk"},signal:AbortSignal.timeout(3000)});return{state:response.ok?"healthy" as const:"degraded" as const,version:this.version,protocolVersion:this.protocolVersion,checkedAt:new Date().toISOString(),...(!response.ok?{reason:`adapter_http_${response.status}`}:{})}}catch(error){return{state:"degraded" as const,version:this.version,protocolVersion:this.protocolVersion,checkedAt:new Date().toISOString(),reason:error instanceof Error?error.message:"adapter_unreachable"}}}
}
export const acpAdapterGateway=new AcpAdapterGatewayClient();
