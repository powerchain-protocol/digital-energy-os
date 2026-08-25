import type { ExternalProvider } from "@powerchain/acp-contracts";
export interface PowerChainProviderRecord extends ExternalProvider{
  apiEndpoint:string;
  eventEndpoint?:string;
  credentialReference?:string;
  status:"active"|"suspended"|"offline";
  categories:string[];
  regions:string[];
  participantType:"prosumer"|"retailer"|"consumer"|"renewable_generator"|"grid_operator"|"utility"|"community"|"aggregator"|"energy_company"|"service_provider";
}
export interface PowerChainProviderDirectory{
  search(input:{organizationId:string;query:string;capabilityId:string;allowedChains:number[];topK:number}):Promise<PowerChainProviderRecord[]>;
  get(input:{organizationId:string;providerId:string}):Promise<PowerChainProviderRecord|null>;
}
export interface ProviderCredentialResolver{resolve(reference:string):Promise<string|null>}
export interface ProviderEventSinkInput{
  organizationId?:string;jobId?:string;providerId?:string;chainId:number;externalJobId:string;eventFingerprint:string;
  externalEventType?:string;mappedEventType:string;payload:unknown;receivedAt:string;
}
