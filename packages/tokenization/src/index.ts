export const TOKENIZATION_VERSION="1.0.0" as const;
export type TokenizationNetwork="SOLANA"|"SUI";
export type TokenizationIntentState="DRAFT"|"REVIEW_REQUIRED"|"APPROVED"|"AWAITING_WALLET"|"SUBMITTED"|"CONFIRMED"|"CANCELLED"|"FAILED";
export type TokenizationAssetClass="VERIFIED_ENERGY_POSITION";

export interface TokenizationIntent{
  id:string;
  organizationId:string;
  energyPositionId:string;
  assetClass:TokenizationAssetClass;
  network:TokenizationNetwork;
  amountWh:bigint;
  state:TokenizationIntentState;
  metadataStandard:"PET-20";
  reviewHash:string;
  walletReference?:string;
  chainReference?:string;
  createdBy:string;
  createdAt:Date;
  updatedAt:Date;
}

export const TOKENIZATION_TRANSITIONS:Record<TokenizationIntentState,readonly TokenizationIntentState[]>={
  DRAFT:["REVIEW_REQUIRED","CANCELLED"],
  REVIEW_REQUIRED:["APPROVED","CANCELLED"],
  APPROVED:["AWAITING_WALLET","CANCELLED"],
  AWAITING_WALLET:["SUBMITTED","CANCELLED"],
  SUBMITTED:["CONFIRMED","FAILED"],
  CONFIRMED:[],
  CANCELLED:[],
  FAILED:[],
};

export function assertTokenizationTransition(current:TokenizationIntentState,next:TokenizationIntentState){
  if(current===next)return;
  if(!TOKENIZATION_TRANSITIONS[current].includes(next))throw new Error(`TOKENIZATION_TRANSITION_INVALID:${current}->${next}`);
}

export function assertTokenizationAmount(input:{amountWh:bigint;availableWh:bigint}){
  if(input.amountWh<=0n)throw new Error("TOKENIZATION_AMOUNT_MUST_BE_POSITIVE");
  if(input.amountWh>input.availableWh)throw new Error("TOKENIZATION_EXCEEDS_AVAILABLE_BACKING");
}

export function tokenizationRequiresExternalWallet(state:TokenizationIntentState){
  return state==="AWAITING_WALLET"||state==="SUBMITTED";
}

export const TOKENIZATION_INVARIANTS=[
  "PHYSICAL_ENERGY_AUTHORITATIVE",
  "TOKENIZATION_OPTIONAL",
  "ACTIVE_CROSS_CHAIN_REPRESENTATIONS_LE_BACKING",
  "HUMAN_APPROVAL_REQUIRED",
  "EXTERNAL_WALLET_SIGNATURE_REQUIRED",
] as const;
