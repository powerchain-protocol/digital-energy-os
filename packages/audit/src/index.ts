export const AUDIT_VERSION="1.0.0" as const;
export interface AuditRecord{ id:string;organizationId:string;actorId:string;action:string;resource:string;resourceId?:string;requestId:string;traceId?:string;correlationId:string;metadata:Record<string,unknown>;createdAt:string }
export function createAuditRecord(input:Omit<AuditRecord,"id"|"createdAt">):AuditRecord{return{id:`aud_${crypto.randomUUID()}`,...input,createdAt:new Date().toISOString()}}
export function redactAuditMetadata(value:Record<string,unknown>){const output:Record<string,unknown>={};for(const[key,item]of Object.entries(value)){output[key]=/password|secret|private.?key|mnemonic|seed|token/i.test(key)?"[REDACTED]":item}return output}
