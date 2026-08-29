export type ChatRole="user"|"assistant"|"system";
export type ChatTokenizedProofSummary={
  settlementStatus:"SETTLED";
  messageUnits:1;
  spentPwrc:"10000";
  pwrcDebitBaseUnits:"10000000000000";
  referenceValueUsd:"0.020000";
  receiptId:string;
  receiptHash:string;
  proofHash:string;
  transferable:false;
  mintedAsset:false;
  financialInstrument:false;
};
export type ChatMessage={id:string;chatId:string;userId:string;role:ChatRole;content:string;createdAt:string;status?:"pending"|"complete"|"error";tokenizedProof?:ChatTokenizedProofSummary};
export type Chat={id:string;userId:string;title:string;modelId:string;createdAt:string;updatedAt:string;messages:ChatMessage[]};
export type ConversationCreditSummary={conversationId:string;messageUnits:number;spentBaseUnits:string;spentPwrc:string;tokenizedResponses:number;proofs:Array<{messageId:string;proofHash:string;receiptId:string;receiptHash:string;createdAt:string}>;receiptSemantics:{settlementStatus:"SETTLED";transferable:false;mintedAsset:false;financialInstrument:false;description:string}};
export type MessageTokenProofResponse={proof:{version:"1.0.0";conversationId:string;messageId:string;quoteHash:string;reservationId:string;responseId:string;responseHash:string;receiptId:string;receiptHash:string;messageUnitId:string;messageUnits:"1";pwrcDebitBaseUnits:"10000000000000";spentPwrc:"10000";referenceValueUsd:"0.020000";settlementStatus:"SETTLED";transferable:false;mintedAsset:false;financialInstrument:false};proofHash:string;signature:string;signingKeyId:string;issuedAt:string;verification:{proofHashValid:boolean;receiptHashValid:boolean;receiptSignatureValid:boolean;semanticsValid:boolean};receiptSemantics:{settlementStatus:"SETTLED";transferable:false;mintedAsset:false;financialInstrument:false;description:string}};
