import { CCT_TOKEN,createTokenIssuanceIntent } from "@powerchain/token-framework";
export const CCT_VERSION="1.0.0" as const;
export const definition=CCT_TOKEN;
export type CarbonCreditState="DRAFT"|"VERIFIED"|"ISSUANCE_READY"|"ISSUED"|"PARTIALLY_RETIRED"|"RETIRED"|"INVALIDATED";
export interface CarbonCreditEvidence{evidenceId:string;methodology:string;projectId:string;vintage:number;quantityGramsCo2e:bigint;verificationHash:string;verifiedAt:string;verifierId:string}
export interface CarbonRetirementIntent{id:string;organizationId:string;mint:string;amountRaw:bigint;beneficiary:string;reason:string;evidenceIds:string[];requiresApproval:true;createdAt:string}
export function prepareCctIssuance(input:{organizationId:string;amountRaw:bigint;recipient:string;evidenceIds:string[];metadataUri?:string}){return createTokenIssuanceIntent({organizationId:input.organizationId,tokenId:"CCT",amountRaw:input.amountRaw,recipient:input.recipient,evidenceIds:input.evidenceIds,...(input.metadataUri?{metadataUri:input.metadataUri}:{}),network:"solana"})}
export function prepareCctRetirement(input:Omit<CarbonRetirementIntent,"id"|"requiresApproval"|"createdAt">):CarbonRetirementIntent{if(input.amountRaw<=0n)throw new Error("CCT retirement amount must be positive");if(!input.reason.trim())throw new Error("CCT retirement reason is required");return{id:`ctr_${crypto.randomUUID()}`,...input,requiresApproval:true,createdAt:new Date().toISOString()}}
