export const AI_MEMORY_VERSION="1.0.0" as const;
export type MemoryLayer="WORKING"|"ORGANIZATION"|"EVIDENCE";
export type MemoryClassification="PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
export interface MemoryRecord{
 id:string;organizationId:string;layer:MemoryLayer;key:string;value:unknown;classification:MemoryClassification;
 evidenceIds:string[];source:string;createdAt:string;expiresAt?:string;version:number;
}
export interface MemoryWriteIntent{organizationId:string;actorId:string;record:Omit<MemoryRecord,"id"|"createdAt"|"version">;requiresApproval:boolean}
export interface MemoryStore{read(input:{organizationId:string;layers:MemoryLayer[];keys?:string[];maxClassification:MemoryClassification}):Promise<MemoryRecord[]>;write(intent:MemoryWriteIntent):Promise<MemoryRecord>}
const rank:Record<MemoryClassification,number>={PUBLIC:0,INTERNAL:1,CONFIDENTIAL:2,RESTRICTED:3};
export function filterMemoryForContext(records:MemoryRecord[],input:{organizationId:string;maxClassification:MemoryClassification;layers:MemoryLayer[]}){return records.filter(record=>record.organizationId===input.organizationId&&input.layers.includes(record.layer)&&rank[record.classification]<=rank[input.maxClassification])}
export function assertEvidenceMemory(record:MemoryRecord){if(record.layer==="EVIDENCE"&&!record.evidenceIds.length)throw Object.assign(new Error("Evidence memory requires provenance references"),{code:"AI_MEMORY_EVIDENCE_REQUIRED"})}
