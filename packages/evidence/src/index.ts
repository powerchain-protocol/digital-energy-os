import { createHash } from "node:crypto";
import type { AcpEvidenceRecord,TruthTier } from "@powerchain/acp-contracts";
import { acpRepositories } from "@powerchain/database/acp";

export function hashEvidence(content:string|Uint8Array){return createHash("sha256").update(content).digest("hex")}
export function sanitizeExternalMessage(content:string){
  return content.replace(/(?:system|developer|assistant)\s*:/gi,"[role label removed]:").replace(/(?:execute|call|invoke)\s+(?:tool|function)/gi,"[tool-instruction removed]").slice(0,32_000);
}
export class EvidenceVault{
  async ingest(input:{organizationId:string;jobId:string;providerId:string;content:string;source:string;sourceTimestamp?:string;classification:string;truthTier?:TruthTier;assetId?:string;projectId?:string}){
    const sanitized=sanitizeExternalMessage(input.content);
    const record=await acpRepositories.evidence.append({organizationId:input.organizationId},{jobId:input.jobId,providerId:input.providerId,contentHash:hashEvidence(input.content),source:input.source,...(input.sourceTimestamp?{sourceTimestamp:input.sourceTimestamp}:{}),validationState:"pending",classification:input.classification,truthTier:input.truthTier??"T1",retentionPolicy:"ACP_JOB_EVIDENCE_V1",...(input.assetId?{assetId:input.assetId}:{}),...(input.projectId?{projectId:input.projectId}:{}),metadata:{sanitizedPreview:sanitized.slice(0,4000),externalUntrusted:true,directAssetMutationAllowed:false}});
    return record;
  }
  list(organizationId:string,jobId:string){return acpRepositories.evidence.list({organizationId},jobId)}
}
export const evidenceVault=new EvidenceVault();
