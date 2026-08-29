import { createHash } from "node:crypto";

export const CHAT_PROOF_VERSION="1.0.0" as const;
export const CHAT_MESSAGE_UNIT="1" as const;
export const CHAT_MESSAGE_UNIT_PWRC="10000" as const;
export const CHAT_MESSAGE_UNIT_BASE_UNITS="10000000000000" as const;
export const CHAT_MESSAGE_REFERENCE_USD="0.020000" as const;
export const CHAT_SETTLEMENT_STATUS="SETTLED" as const;

export type TokenizedChatProof={
  version:"1.0.0";
  conversationId:string;
  messageId:string;
  quoteHash:string;
  reservationId:string;
  responseId:string;
  responseHash:string;
  receiptId:string;
  receiptHash:string;
  messageUnitId:string;
  messageUnits:"1";
  pwrcDebitBaseUnits:"10000000000000";
  spentPwrc:"10000";
  referenceValueUsd:"0.020000";
  settlementStatus:"SETTLED";
  transferable:false;
  mintedAsset:false;
  financialInstrument:false;
};

export function canonicalJson(value:unknown):string{
  if(value===null||typeof value!=="object")return JSON.stringify(value);
  if(Array.isArray(value))return `[${value.map(canonicalJson).join(",")}]`;
  const record=value as Record<string,unknown>;
  return `{${Object.keys(record).sort().map(key=>`${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}
export function sha256Hex(value:string|Uint8Array){return createHash("sha256").update(value).digest("hex")}
export function hashCanonical(value:unknown){return sha256Hex(canonicalJson(value))}
export function createCanonicalChatQuote(input:{conversationId:string;userId:string;requestId:string;createdAt:string;expiresAt:string}){
  return{version:"1.0.0" as const,kind:"POWERCHAIN_COPILOT_MESSAGE_UNIT" as const,conversationId:input.conversationId,userId:input.userId,requestId:input.requestId,messageUnits:CHAT_MESSAGE_UNIT,pwrcAmount:CHAT_MESSAGE_UNIT_PWRC,pwrcDebitBaseUnits:CHAT_MESSAGE_UNIT_BASE_UNITS,referenceValueUsd:CHAT_MESSAGE_REFERENCE_USD,transferable:false,mintedAsset:false,financialInstrument:false,createdAt:input.createdAt,expiresAt:input.expiresAt};
}
export function createTokenizedChatProof(input:{conversationId:string;messageId:string;quoteHash:string;reservationId:string;responseId:string;responseHash:string;receiptId:string;receiptHash:string;messageUnitId:string}):TokenizedChatProof{
  return{version:CHAT_PROOF_VERSION,conversationId:input.conversationId,messageId:input.messageId,quoteHash:input.quoteHash,reservationId:input.reservationId,responseId:input.responseId,responseHash:input.responseHash,receiptId:input.receiptId,receiptHash:input.receiptHash,messageUnitId:input.messageUnitId,messageUnits:CHAT_MESSAGE_UNIT,pwrcDebitBaseUnits:CHAT_MESSAGE_UNIT_BASE_UNITS,spentPwrc:CHAT_MESSAGE_UNIT_PWRC,referenceValueUsd:CHAT_MESSAGE_REFERENCE_USD,settlementStatus:CHAT_SETTLEMENT_STATUS,transferable:false,mintedAsset:false,financialInstrument:false};
}
export function tokenizedChatProofHash(proof:TokenizedChatProof){return hashCanonical(proof)}
