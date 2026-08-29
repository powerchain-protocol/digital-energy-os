export const ASSET_GRAPH_VERSION="1.0.0" as const;
export type AssetNodeType="ORGANIZATION"|"PORTFOLIO"|"ASSET"|"DEVICE"|"METER"|"ENERGY_POSITION"|"TOKEN"|"TREASURY_ACCOUNT"|"INVESTOR"|"CARBON_CREDIT"|"EVIDENCE"|"SETTLEMENT";
export type AssetRelationshipType="OWNS"|"MONITORS"|"GENERATES"|"BACKS"|"SETTLES"|"VERIFIED_BY"|"TOKENIZED_AS"|"CONNECTED_TO"|"PRODUCES"|"ALLOCATES_TO"|"REPRESENTS"|"RETIRES";
export interface AssetGraphNode{id:string;organizationId:string;type:AssetNodeType;label:string;metadata:Record<string,unknown>;version:number;updatedAt:string}
export interface AssetRelationship{id:string;organizationId:string;from:string;to:string;type:AssetRelationshipType;evidenceIds:string[];validFrom:string;validTo?:string}
export interface GraphProvenance{id:string;organizationId:string;source:string;sourceRecordId:string;observedAt:string;receivedAt:string;evidenceHash?:string;truthTier:"T0"|"T1"|"T2"|"T3"|"T4"}
export interface AssetGraphSnapshot{organizationId:string;nodes:AssetGraphNode[];relationships:AssetRelationship[];provenance:GraphProvenance[];observedAt:string}
export function queryNeighbors(snapshot:AssetGraphSnapshot,nodeId:string,type?:AssetRelationshipType){const edges=snapshot.relationships.filter(e=>(e.from===nodeId||e.to===nodeId)&&(!type||e.type===type));const ids=new Set(edges.flatMap(e=>[e.from,e.to]).filter(id=>id!==nodeId));return snapshot.nodes.filter(n=>ids.has(n.id))}
export function assertGraphTenant(snapshot:AssetGraphSnapshot,organizationId:string){if(snapshot.organizationId!==organizationId||snapshot.nodes.some(n=>n.organizationId!==organizationId)||snapshot.relationships.some(e=>e.organizationId!==organizationId))throw Object.assign(new Error("Asset Graph tenant mismatch"),{code:"ASSET_GRAPH_TENANT_MISMATCH"})}
