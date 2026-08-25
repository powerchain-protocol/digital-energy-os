export const ENERGY_NETWORK_VERSION="1.0.0" as const;
export type EnergyParticipantType="consumer"|"prosumer"|"retailer"|"renewable_generator"|"grid_operator"|"utility"|"community"|"aggregator"|"energy_company"|"service_provider"|"partner";
export interface EnergyNetworkParticipant{
 id:string;organizationId?:string;publicId:string;name:string;type:EnergyParticipantType;country:string;region?:string;location?:{latitude:number;longitude:number};
 capabilities:string[];energySources:string[];markets:string[];verified:boolean;publicProfile:boolean;metadata:Record<string,unknown>;updatedAt:string;
}
export interface EnergyNetworkSearch{query?:string;types?:EnergyParticipantType[];country?:string;region?:string;capabilities?:string[];energySources?:string[];market?:string;verifiedOnly?:boolean;limit?:number}
export function matchesParticipant(p:EnergyNetworkParticipant,q:EnergyNetworkSearch){
 if(!p.publicProfile)return false;if(q.types?.length&&!q.types.includes(p.type))return false;if(q.country&&p.country.toLowerCase()!==q.country.toLowerCase())return false;
 if(q.region&&p.region?.toLowerCase()!==q.region.toLowerCase())return false;if(q.verifiedOnly&&!p.verified)return false;
 if(q.capabilities?.some(c=>!p.capabilities.includes(c)))return false;if(q.energySources?.some(s=>!p.energySources.includes(s)))return false;if(q.market&&!p.markets.includes(q.market))return false;
 const query=q.query?.trim().toLowerCase();return !query||`${p.name} ${p.type} ${p.country} ${p.region??""} ${p.capabilities.join(" ")} ${p.energySources.join(" ")}`.toLowerCase().includes(query)
}
