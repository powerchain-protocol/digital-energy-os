import { createHmac } from "node:crypto";
import { PowerChainAcpAdapterError,ambiguous } from "./errors";
import type { PowerChainProviderRecord,ProviderCredentialResolver } from "./types";

function checkedEndpoint(value:string){
  const url=new URL(value);
  const local=["localhost","127.0.0.1","::1"].includes(url.hostname);
  if(url.protocol!=="https:"&&!local)throw new PowerChainAcpAdapterError("ACP_PROVIDER_ENDPOINT_REQUIRES_HTTPS","Provider endpoint must use HTTPS outside loopback development");
  return url.toString().replace(/\/$/,"");
}
function canonicalBody(value:unknown){return JSON.stringify(value)}
export class PowerChainProviderClient{
  constructor(private readonly credentials:ProviderCredentialResolver){}
  private async request(provider:PowerChainProviderRecord,path:string,init:{method:"GET"|"POST";body?:unknown;idempotencyKey?:string;requestId?:string}){
    if(provider.status!=="active")throw new PowerChainAcpAdapterError("ACP_PROVIDER_NOT_ACTIVE",`Provider ${provider.name} is ${provider.status}`);
    const endpoint=checkedEndpoint(provider.apiEndpoint);
    const body=init.body===undefined?undefined:canonicalBody(init.body);
    const headers:Record<string,string>={accept:"application/json","x-powerchain-protocol-version":"1.0.0"};
    if(body)headers["content-type"]="application/json";
    if(init.idempotencyKey)headers["idempotency-key"]=init.idempotencyKey;
    if(init.requestId)headers["x-request-id"]=init.requestId;
    if(provider.credentialReference){
      const secret=await this.credentials.resolve(provider.credentialReference);
      if(!secret)throw new PowerChainAcpAdapterError("ACP_PROVIDER_CREDENTIAL_UNAVAILABLE","Provider credential reference could not be resolved");
      headers["x-powerchain-signature"]=createHmac("sha256",secret).update(body??`${init.method}:${path}`).digest("hex");
    }
    try{
      const response=await fetch(`${endpoint}${path}`,{method:init.method,headers,body,signal:AbortSignal.timeout(15_000),cache:"no-store"});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new PowerChainAcpAdapterError(`ACP_PROVIDER_HTTP_${response.status}`,payload&&typeof payload==="object"&&"message" in payload?String(payload.message):`Provider returned HTTP ${response.status}`);
      return payload;
    }catch(error){
      if(error instanceof PowerChainAcpAdapterError)throw error;
      if(ambiguous(error))throw new PowerChainAcpAdapterError("ACP_PROVIDER_RESULT_UNKNOWN","Provider transport result is ambiguous",error);
      throw new PowerChainAcpAdapterError("ACP_PROVIDER_UNAVAILABLE",error instanceof Error?error.message:"Provider request failed",error);
    }
  }
  createJob(provider:PowerChainProviderRecord,input:unknown,idempotencyKey:string){return this.request(provider,"/v1/jobs",{method:"POST",body:input,idempotencyKey})}
  fundJob(provider:PowerChainProviderRecord,externalJobId:string,input:unknown,idempotencyKey:string){return this.request(provider,`/v1/jobs/${encodeURIComponent(externalJobId)}/funding`,{method:"POST",body:input,idempotencyKey})}
  completeJob(provider:PowerChainProviderRecord,externalJobId:string,input:unknown,idempotencyKey:string){return this.request(provider,`/v1/jobs/${encodeURIComponent(externalJobId)}/completion`,{method:"POST",body:input,idempotencyKey})}
  rejectJob(provider:PowerChainProviderRecord,externalJobId:string,input:unknown,idempotencyKey:string){return this.request(provider,`/v1/jobs/${encodeURIComponent(externalJobId)}/rejection`,{method:"POST",body:input,idempotencyKey})}
  getJob(provider:PowerChainProviderRecord,externalJobId:string){return this.request(provider,`/v1/jobs/${encodeURIComponent(externalJobId)}`,{method:"GET"})}
}
