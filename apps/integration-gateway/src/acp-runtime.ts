import { createHmac,timingSafeEqual } from "node:crypto";
import type { AgentCommerceAdapter } from "@powerchain/acp-contracts";
import { createPowerChainAcpAdapter,mapProviderEventType,providerEventFingerprint,type ProviderCredentialResolver } from "@powerchain/acp-adapter-powerchain";
import { acpRepositories } from "@powerchain/database/acp";
import { PostgresPowerChainProviderDirectory } from "@powerchain/database/acp-provider-network";

const directory=new PostgresPowerChainProviderDirectory();
const globalRuntime=globalThis as unknown as{powerchainAcpAdapter?:AgentCommerceAdapter;powerchainAcpStarted?:boolean;powerchainAcpStartError?:string};

export function verifyInternalBody(body:string,signature:string|undefined){const secret=process.env.POWERCHAIN_INTERNAL_SERVICE_SECRET?.trim();if(!secret)throw Object.assign(new Error("Internal service secret is not configured"),{code:"INTERNAL_AUTH_UNCONFIGURED"});if(!signature)throw Object.assign(new Error("Internal service signature is required"),{code:"UNAUTHORIZED"});const expected=createHmac("sha256",secret).update(body).digest("hex");const a=Buffer.from(expected),b=Buffer.from(signature);if(a.length!==b.length||!timingSafeEqual(a,b))throw Object.assign(new Error("Invalid internal service signature"),{code:"UNAUTHORIZED"})}

class VaultCredentialResolver implements ProviderCredentialResolver{
  async resolve(reference:string){
    if(reference.startsWith("env:")&&process.env.NODE_ENV!=="production")return process.env[reference.slice(4)]?.trim()??null;
    const endpoint=process.env.POWERCHAIN_VAULT_RESOLVER_URL?.trim();const secret=process.env.POWERCHAIN_INTERNAL_SERVICE_SECRET?.trim();
    if(!endpoint||!secret)return null;
    const url=new URL(endpoint);if(url.protocol!=="https:"&&!['localhost','127.0.0.1','::1'].includes(url.hostname))throw new Error("POWERCHAIN_VAULT_RESOLVER_REQUIRES_HTTPS");
    const body=JSON.stringify({reference,purpose:"acp-provider-auth"});const signature=createHmac("sha256",secret).update(body).digest("hex");
    const response=await fetch(url,{method:"POST",headers:{"content-type":"application/json","x-powerchain-internal-signature":signature},body,signal:AbortSignal.timeout(5000)});
    const payload=await response.json().catch(()=>null) as {secret?:string}|null;return response.ok&&payload?.secret?payload.secret:null;
  }
}
const credentials=new VaultCredentialResolver();

export async function ingestPowerChainProviderEvent(input:{providerId:string;signature?:string;body:string}){
  const parsed=JSON.parse(input.body) as Record<string,unknown>;
  const organizationId=typeof parsed.organizationId==="string"?parsed.organizationId:undefined;
  const chainId=Number(parsed.chainId);const externalJobId=String(parsed.externalJobId??"");const type=typeof parsed.type==="string"?parsed.type:undefined;
  if(!Number.isInteger(chainId)||!externalJobId)throw Object.assign(new Error("Provider event requires chainId and externalJobId"),{code:"ACP_PROVIDER_EVENT_INVALID"});
  let provider=null;if(organizationId)provider=await directory.get({organizationId,providerId:input.providerId});
  if(!provider){const job=await acpRepositories.jobs.findByExternalJob(chainId,externalJobId);if(job)provider=await directory.get({organizationId:job.organizationId,providerId:input.providerId})}
  if(!provider)throw Object.assign(new Error("ACP provider is not registered"),{code:"ACP_PROVIDER_NOT_FOUND"});
  if(provider.credentialReference){const secret=await credentials.resolve(provider.credentialReference);if(!secret)throw Object.assign(new Error("Provider webhook credential is unavailable"),{code:"ACP_PROVIDER_CREDENTIAL_UNAVAILABLE"});const expected=createHmac("sha256",secret).update(input.body).digest("hex");const a=Buffer.from(expected),b=Buffer.from(input.signature??"");if(a.length!==b.length||!timingSafeEqual(a,b))throw Object.assign(new Error("Provider event signature is invalid"),{code:"UNAUTHORIZED"})}
  const mappedEventType=mapProviderEventType(type) as any;const eventFingerprint=providerEventFingerprint({providerId:input.providerId,chainId,externalJobId,type,payload:parsed.payload??parsed});
  const job=await acpRepositories.jobs.findByExternalJob(chainId,externalJobId);
  if(!job){await acpRepositories.orphans.receive({source:"powerchain-acp",chainId,externalJobId,eventFingerprint,externalEventType:type as any,mappedEventType,payload:parsed.payload??parsed,receivedAt:new Date().toISOString()});return{state:"orphaned" as const,eventFingerprint}}
  await acpRepositories.inbox.receive({organizationId:job.organizationId},{source:"powerchain-acp",chainId,externalJobId,eventFingerprint,externalEventType:type as any,mappedEventType,payload:parsed.payload??parsed,receivedAt:new Date().toISOString()});
  return{state:"accepted" as const,eventFingerprint,jobId:job.id}
}

export async function startAcpAdapter(){if(globalRuntime.powerchainAcpStarted&&globalRuntime.powerchainAcpAdapter)return globalRuntime.powerchainAcpAdapter;try{const adapter=createPowerChainAcpAdapter(directory,credentials);await adapter.start();globalRuntime.powerchainAcpAdapter=adapter;globalRuntime.powerchainAcpStarted=true;globalRuntime.powerchainAcpStartError=undefined;return adapter}catch(error){globalRuntime.powerchainAcpStartError=error instanceof Error?error.message:String(error);globalRuntime.powerchainAcpStarted=false;throw error}}
export function getAcpAdapter(){const adapter=globalRuntime.powerchainAcpAdapter;if(!adapter)throw Object.assign(new Error(globalRuntime.powerchainAcpStartError??"ACP adapter has not started"),{code:"ACP_ADAPTER_NOT_READY"});return adapter}
export async function stopAcpAdapter(){if(globalRuntime.powerchainAcpAdapter)await globalRuntime.powerchainAcpAdapter.stop();globalRuntime.powerchainAcpStarted=false;globalRuntime.powerchainAcpAdapter=undefined}
export async function acpAdapterReadiness(){if(!globalRuntime.powerchainAcpAdapter)return{ready:false,reason:globalRuntime.powerchainAcpStartError??"not_started"};const health=await globalRuntime.powerchainAcpAdapter.health();return{ready:health.state==="healthy",health}}
