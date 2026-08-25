import type { AgentCommerceAdapter,AuthorizedCompletion,AuthorizedCreateJob,AuthorizedFunding,AuthorizedRejection,DiscoverProvidersInput,ExternalJobLookup,ExternalJobSnapshot,ExternalProvider } from "@powerchain/acp-contracts";
import { PowerChainProviderClient } from "./client";
import { PowerChainAcpAdapterError } from "./errors";
import type { PowerChainProviderDirectory,PowerChainProviderRecord } from "./types";

function externalId(payload:unknown){
  if(payload&&typeof payload==="object"){
    for(const key of ["externalJobId","jobId","id"]){const value=(payload as Record<string,unknown>)[key];if(typeof value==="string"&&value.trim())return value.trim()}
  }
  return "";
}
function state(payload:unknown):ExternalJobSnapshot["status"]{
  if(payload&&typeof payload==="object"){
    const raw=String((payload as Record<string,unknown>).status??(payload as Record<string,unknown>).state??"unknown").toLowerCase().replaceAll("-","_");
    if(["open","budget_set","funded","submitted","completed","rejected","expired"].includes(raw))return raw as ExternalJobSnapshot["status"];
  }
  return "unknown";
}
export class PowerChainAcpAdapter implements AgentCommerceAdapter{
  readonly version="1.0.0" as const;
  readonly protocolVersion="1.0.0" as const;
  private started=false;
  constructor(private readonly directory:PowerChainProviderDirectory,private readonly client:PowerChainProviderClient){}
  async start(){this.started=true}
  async stop(){this.started=false}
  async discoverProviders(input:DiscoverProvidersInput):Promise<ExternalProvider[]>{
    const rows=await this.directory.search({organizationId:input.organizationId,query:input.query,capabilityId:input.capabilityId,allowedChains:input.allowedChains,topK:input.topK??10});
    return rows.filter(row=>row.status==="active");
  }
  private async provider(organizationId:string,providerId:string){const row=await this.directory.get({organizationId,providerId});if(!row)throw new PowerChainAcpAdapterError("ACP_PROVIDER_NOT_FOUND","PowerChain ACP provider was not found");return row}
  async createJob(input:AuthorizedCreateJob){
    const provider=await this.provider(input.organizationId,input.providerAddress);
    const raw=await this.client.createJob(provider,{jobId:input.jobId,chainId:input.chainId,offeringName:input.offeringName,evaluatorAddress:input.evaluatorAddress,requirements:input.requirements,authorizationId:input.authorizationId},input.idempotencyKey);
    const id=externalId(raw);if(!id)throw new PowerChainAcpAdapterError("ACP_CREATE_JOB_UNKNOWN","Provider accepted the request but returned no durable job identifier");
    return{externalJobId:id,chainId:input.chainId,raw};
  }
  async fundJob(input:AuthorizedFunding){
    const provider=await this.provider(input.organizationId,input.providerId??"");
    try{const result=await this.client.fundJob(provider,input.externalJobId,{jobId:input.jobId,authorizationId:input.authorizationId,asset:input.amount.asset,rawAmount:input.amount.rawAmount,paymentReference:input.paymentReference??null},input.idempotencyKey);return{status:"success" as const,externalJobId:input.externalJobId,transactionReference:input.paymentReference,result}}
    catch(error){if(error instanceof PowerChainAcpAdapterError&&error.code==="ACP_PROVIDER_RESULT_UNKNOWN")return{status:"unknown" as const,externalJobId:input.externalJobId};throw error}
  }
  async completeJob(input:AuthorizedCompletion){const provider=await this.provider(input.organizationId,input.providerId??"");try{const result=await this.client.completeJob(provider,input.externalJobId,{jobId:input.jobId,authorizationId:input.authorizationId,reason:input.reason},input.idempotencyKey);return{status:"success" as const,externalJobId:input.externalJobId,result}}catch(error){if(error instanceof PowerChainAcpAdapterError&&error.code==="ACP_PROVIDER_RESULT_UNKNOWN")return{status:"unknown" as const,externalJobId:input.externalJobId};throw error}}
  async rejectJob(input:AuthorizedRejection){const provider=await this.provider(input.organizationId,input.providerId??"");try{const result=await this.client.rejectJob(provider,input.externalJobId,{jobId:input.jobId,authorizationId:input.authorizationId,reason:input.reason},input.idempotencyKey);return{status:"success" as const,externalJobId:input.externalJobId,result}}catch(error){if(error instanceof PowerChainAcpAdapterError&&error.code==="ACP_PROVIDER_RESULT_UNKNOWN")return{status:"unknown" as const,externalJobId:input.externalJobId};throw error}}
  async getJob(input:ExternalJobLookup){const provider=await this.provider(input.organizationId,input.providerId??"");const raw=await this.client.getJob(provider,input.externalJobId);return{externalJobId:input.externalJobId,chainId:input.chainId,status:state(raw),providerAddress:provider.externalProviderId,entriesCount:Array.isArray((raw as any)?.entries)?(raw as any).entries.length:0,raw}}
  async health(){return{state:this.started?"healthy" as const:"degraded" as const,version:this.version,protocolVersion:this.protocolVersion,checkedAt:new Date().toISOString(),...(this.started?{}:{reason:"adapter_not_started"})}}
}
