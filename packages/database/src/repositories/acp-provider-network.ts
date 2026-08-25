import "server-only";
import { getPostgresPool } from "../clients/postgres";
import type { ExternalProvider } from "@powerchain/acp-contracts";

export type AcpProviderParticipantType="prosumer"|"retailer"|"consumer"|"renewable_generator"|"grid_operator"|"utility"|"community"|"aggregator"|"energy_company"|"service_provider";
export interface PowerChainProviderRecord extends ExternalProvider{
  apiEndpoint:string;
  eventEndpoint?:string;
  credentialReference?:string;
  status:"active"|"suspended"|"offline";
  categories:string[];
  regions:string[];
  participantType:AcpProviderParticipantType;
}
interface Row{
 id:string;organization_id:string|null;public_id:string;name:string;participant_type:AcpProviderParticipantType;wallet_address:string;identity_hash:string;
 api_endpoint:string;event_endpoint:string|null;credential_reference:string|null;status:PowerChainProviderRecord["status"];capabilities:string[];offerings:unknown;chains:number[];categories:string[];regions:string[];successful_jobs:number;success_rate:number|null;metadata:unknown;
}
function map(row:Row):PowerChainProviderRecord{return{
 externalProviderId:row.public_id,walletAddress:row.wallet_address,name:row.name,identityHash:row.identity_hash,capabilities:row.capabilities??[],offerings:Array.isArray(row.offerings)?row.offerings as PowerChainProviderRecord["offerings"]:[],chains:row.chains??[],successfulJobs:row.successful_jobs,successRate:row.success_rate??undefined,metadata:(row.metadata&&typeof row.metadata==="object"?row.metadata:{}) as Record<string,unknown>,apiEndpoint:row.api_endpoint,eventEndpoint:row.event_endpoint??undefined,credentialReference:row.credential_reference??undefined,status:row.status,categories:row.categories??[],regions:row.regions??[],participantType:row.participant_type,
}}
export class PostgresPowerChainProviderDirectory{
 async search(input:{organizationId:string;query:string;capabilityId:string;allowedChains:number[];topK:number}){
  const q=`%${input.query.trim().toLowerCase()}%`;
  const result=await getPostgresPool().query<Row>(`select * from acp_provider_directory
    where status='active'
      and ($1='' or lower(name) like $2 or lower(array_to_string(capabilities,' ')) like $2 or lower(array_to_string(categories,' ')) like $2)
      and ($3='' or $3=any(capabilities))
      and (cardinality($4::int[])=0 or chains && $4::int[])
      and (organization_id is null or organization_id=$5)
    order by successful_jobs desc, success_rate desc nulls last, name asc
    limit $6`,[input.query.trim(),q,input.capabilityId,input.allowedChains,input.organizationId,Math.max(1,Math.min(input.topK,50))]);
  return result.rows.map(map)
 }
 async get(input:{organizationId:string;providerId:string}){const result=await getPostgresPool().query<Row>(`select * from acp_provider_directory where (public_id=$1 or id=$1 or wallet_address=$1) and (organization_id is null or organization_id=$2) limit 1`,[input.providerId,input.organizationId]);return result.rows[0]?map(result.rows[0]):null}
 async upsert(input:{organizationId?:string|null;publicId:string;name:string;participantType:AcpProviderParticipantType;walletAddress:string;identityHash:string;apiEndpoint:string;eventEndpoint?:string;credentialReference?:string;status?:PowerChainProviderRecord["status"];capabilities:string[];offerings:PowerChainProviderRecord["offerings"];chains:number[];categories:string[];regions:string[];metadata?:Record<string,unknown>}){
  const id=`pcp_${crypto.randomUUID().replaceAll("-","")}`;
  const result=await getPostgresPool().query<Row>(`insert into acp_provider_directory(id,organization_id,public_id,name,participant_type,wallet_address,identity_hash,api_endpoint,event_endpoint,credential_reference,status,capabilities,offerings,chains,categories,regions,metadata)
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17::jsonb)
    on conflict(public_id) do update set name=excluded.name,participant_type=excluded.participant_type,wallet_address=excluded.wallet_address,identity_hash=excluded.identity_hash,api_endpoint=excluded.api_endpoint,event_endpoint=excluded.event_endpoint,credential_reference=excluded.credential_reference,status=excluded.status,capabilities=excluded.capabilities,offerings=excluded.offerings,chains=excluded.chains,categories=excluded.categories,regions=excluded.regions,metadata=excluded.metadata,updated_at=now() returning *`,[id,input.organizationId??null,input.publicId,input.name,input.participantType,input.walletAddress,input.identityHash,input.apiEndpoint,input.eventEndpoint??null,input.credentialReference??null,input.status??"active",input.capabilities,JSON.stringify(input.offerings),input.chains,input.categories,input.regions,JSON.stringify(input.metadata??{})]);return map(result.rows[0]!)
 }
}
