import type { CheckoutCurrency, CheckoutLineInput } from "@powerchain/checkout";
import type { ExplorerKind, ExplorerNetwork } from "@powerchain/explorer";
import type { TokenizationIntentState, TokenizationNetwork } from "@powerchain/tokenization";

export interface MarketplaceListingView{
  id:string;organizationId:string;sellerId:string;slug:string;title:string;description:string;category:string;source?:string|null;location?:string|null;
  currency:CheckoutCurrency;unitAmountMinor:string;inventory:number;remaining:number;status:string;metadata:Record<string,unknown>;createdAt:string;updatedAt:string;
}
export interface MarketplaceOrderView{
  id:string;organizationId:string;listingId:string;buyerId:string;quantity:number;amountMinor:string;currency:CheckoutCurrency;status:string;checkoutSessionId?:string;createdAt:string;updatedAt:string;
}
export interface CheckoutSessionView{
  id:string;organizationId:string;userId:string;currency:CheckoutCurrency;status:string;lines:CheckoutLineInput[];
  totals:{subtotalMinor:string;serviceFeeMinor:string;networkFeeMinor:string|null;totalMinor:string};
  payerWallet?:string;settlementSignature?:string;expiresAt:string;createdAt:string;updatedAt:string;
}
export interface ExplorerResolution{
  network:ExplorerNetwork;kind:ExplorerKind;identifier:string;url:string;family:"SOLANA"|"SUI";
}
export interface TokenizationIntentView{
  id:string;organizationId:string;createdBy:string;energyPositionId:string;network:TokenizationNetwork;amountWh:string;state:TokenizationIntentState;
  assetClass:"VERIFIED_ENERGY_POSITION";metadataStandard:"PET-20";reviewHash:string;walletReference?:string;chainReference?:string;createdAt:string;updatedAt:string;
}
export interface CommerceApiEnvelope<T>{
  data:T;
  meta:{requestId:string;correlationId:string;organizationId:string;dataMode:"DEMO"|"LIVE";observedAt:string};
}
