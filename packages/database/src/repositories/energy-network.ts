import "server-only";
import { getPostgresPool } from "../clients/postgres";
import type { EnergyNetworkParticipant,EnergyNetworkSearch,EnergyParticipantType } from "@powerchain/energy-network";

function participant(row:Record<string,unknown>):EnergyNetworkParticipant{return{
 id:String(row.id),...(row.organization_id?{organizationId:String(row.organization_id)}:{}),publicId:String(row.public_id),name:String(row.name),type:String(row.participant_type) as EnergyParticipantType,country:String(row.country),...(row.region?{region:String(row.region)}:{}),...(row.latitude!==null&&row.latitude!==undefined&&row.longitude!==null&&row.longitude!==undefined?{location:{latitude:Number(row.latitude),longitude:Number(row.longitude)}}:{}),capabilities:Array.isArray(row.capabilities)?row.capabilities.map(String):[],energySources:Array.isArray(row.energy_sources)?row.energy_sources.map(String):[],markets:Array.isArray(row.markets)?row.markets.map(String):[],verified:Boolean(row.verified),publicProfile:Boolean(row.public_profile),metadata:(row.metadata as Record<string,unknown>)??{},updatedAt:new Date(String(row.updated_at)).toISOString(),
}}
export class EnergyNetworkRepository{
 async search(organizationId:string,input:EnergyNetworkSearch){
  const limit=Math.max(1,Math.min(input.limit??50,100));
  const q=input.query?.trim()||null;
  const types=input.types?.length?input.types:null;
  const caps=input.capabilities?.length?input.capabilities:null;
  const sources=input.energySources?.length?input.energySources:null;
  const result=await getPostgresPool().query(`
   select * from energy_network_participants
   where (public_profile=true or organization_id=$1)
     and ($2::text is null or name ilike '%'||$2||'%' or participant_type ilike '%'||$2||'%' or country ilike '%'||$2||'%' or coalesce(region,'') ilike '%'||$2||'%' or array_to_string(capabilities,' ') ilike '%'||$2||'%' or array_to_string(energy_sources,' ') ilike '%'||$2||'%')
     and ($3::text[] is null or participant_type=any($3))
     and ($4::text is null or lower(country)=lower($4))
     and ($5::text is null or lower(coalesce(region,''))=lower($5))
     and ($6::text[] is null or capabilities @> $6)
     and ($7::text[] is null or energy_sources @> $7)
     and ($8::text is null or $8=any(markets))
     and ($9::boolean=false or verified=true)
   order by verified desc, public_profile desc, name asc
   limit $10
  `,[organizationId,q,types,input.country?.trim()||null,input.region?.trim()||null,caps,sources,input.market?.trim()||null,Boolean(input.verifiedOnly),limit]);
  return result.rows.map(row=>participant(row));
 }
 async upsert(input:Omit<EnergyNetworkParticipant,"id"|"updatedAt">&{id?:string}){
  const id=input.id??`enp_${crypto.randomUUID().replaceAll("-","")}`;
  const result=await getPostgresPool().query(`
   insert into energy_network_participants(id,organization_id,public_id,name,participant_type,country,region,latitude,longitude,capabilities,energy_sources,markets,verified,public_profile,metadata)
   values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
   on conflict(public_id) do update set organization_id=excluded.organization_id,name=excluded.name,participant_type=excluded.participant_type,country=excluded.country,region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,capabilities=excluded.capabilities,energy_sources=excluded.energy_sources,markets=excluded.markets,verified=excluded.verified,public_profile=excluded.public_profile,metadata=excluded.metadata,updated_at=now()
   returning *
  `,[id,input.organizationId??null,input.publicId,input.name,input.type,input.country,input.region??null,input.location?.latitude??null,input.location?.longitude??null,input.capabilities,input.energySources,input.markets,input.verified,input.publicProfile,JSON.stringify(input.metadata)]);
  return participant(result.rows[0]!);
 }
}
