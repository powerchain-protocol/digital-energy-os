export type CopilotMessagePricingClass="BASE"|"REAL_DATA";
export type CopilotDisplayCurrency="USD"|"EUR"|"SOL"|"PWRC";
export type CreditLedgerEntryType="deposit"|"purchase"|"reservation"|"settlement"|"release"|"admin_adjustment";
export type MarketRateSource="pyth-hermes"|"jupiter-price-v3"|"policy-reference"|"configured-reference";

export interface CreditLedgerEntry{
  id:string;accountId:string;type:CreditLedgerEntryType;pwrcRaw:string;requestId?:string;quoteId?:string;reservationId?:string;externalReference?:string;metadata?:Record<string,string>;createdAt:string;
}
export interface CreditReservation{
  id:string;accountId:string;quoteId:string;reservedPwrcRaw:string;settledPwrcRaw:string;state:"reserved"|"settled"|"released";requestId:string;createdAt:string;settledAt?:string;
}
export interface CreditMarketRate{
  pair:"SOL/USD"|"EUR/USD";
  price:string;
  source:MarketRateSource;
  observedAt:string;
  publishTime?:string;
  confidence?:string;
}
export interface CopilotCreditMarketRates{
  solUsd?:CreditMarketRate;
  eurUsd?:CreditMarketRate;
  observedAt:string;
  state:"LIVE"|"PARTIAL"|"UNAVAILABLE";
}
export interface CopilotCreditQuote{
  quoteId:string;
  pricingClass:CopilotMessagePricingClass;
  usdCharge:string;
  eurCharge?:string;
  pwrcUsdPrice:string;
  pwrcPriceSource:"policy-reference"|"oracle";
  pwrcAmount:string;
  pwrcRaw:string;
  solUsdPrice?:string;
  solPriceSource?:string;
  solEquivalent?:string;
  eurUsdPrice?:string;
  eurPriceSource?:string;
  displayCurrency?:CopilotDisplayCurrency;
  displayAmount?:string;
  expiresAt:string;
}
export interface CopilotCreditAccountView{
  id:string;
  balancePwrc:string;
  reservedPwrc:string;
  availablePwrc:string;
}
export interface CopilotCreditQuoteView extends CopilotCreditQuote{}
