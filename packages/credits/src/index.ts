export const COPILOT_CREDITS_VERSION="1.0.0" as const;
export const PWRC_DECIMALS=9 as const;
export const PWRC_REFERENCE_USD="0.000002" as const;
export const COPILOT_BASE_MESSAGE_USD="0.020" as const;
export const COPILOT_REAL_DATA_MESSAGE_USD="0.015" as const;
export type CopilotMessagePricingClass="BASE"|"REAL_DATA";
export type CreditLedgerEntryType="deposit"|"purchase"|"reservation"|"settlement"|"release"|"admin_adjustment";
export interface CreditLedgerEntry{id:string;accountId:string;type:CreditLedgerEntryType;pwrcRaw:string;balanceAfterRaw?:string;requestId?:string;quoteId?:string;metadata?:Record<string,string>;createdAt:string}
export interface CreditReservation{id:string;accountId:string;quoteId:string;reservedPwrcRaw:string;settledPwrcRaw:string;state:"reserved"|"settled"|"released";createdAt:string}
function checkedDecimal(value:string){if(!/^\d+(\.\d+)?$/.test(value))throw new Error("Invalid decimal amount")}
export function decimalToBaseUnits(value:string,decimals=PWRC_DECIMALS):bigint{checkedDecimal(value);const[whole,fraction=""]=value.split(".");return BigInt(whole)*10n**BigInt(decimals)+BigInt((fraction+"0".repeat(decimals)).slice(0,decimals)||"0")}
export function baseUnitsToDecimal(value:bigint,decimals=PWRC_DECIMALS){const scale=10n**BigInt(decimals),whole=value/scale,fraction=(value%scale).toString().padStart(decimals,"0").replace(/0+$/g,"");return fraction?`${whole}.${fraction}`:whole.toString()}
export function divideDecimal(numerator:string,denominator:string,decimals=PWRC_DECIMALS){const n=decimalToBaseUnits(numerator,6),d=decimalToBaseUnits(denominator,6);if(d<=0n)throw new Error("Denominator must be positive");return baseUnitsToDecimal(n*10n**BigInt(decimals)/d,decimals)}
export function quotePwrc(usdCharge:string,pwrcUsdPrice:string){const pwrcAmount=divideDecimal(usdCharge,pwrcUsdPrice,PWRC_DECIMALS);return{pwrcAmount,pwrcRaw:decimalToBaseUnits(pwrcAmount,PWRC_DECIMALS).toString()}}
export function priceForClass(value:CopilotMessagePricingClass){return value==="REAL_DATA"?COPILOT_REAL_DATA_MESSAGE_USD:COPILOT_BASE_MESSAGE_USD}
export function createUsageQuote(input:{estimatedUsd:string;pwrcUsdPrice:string;ttlSeconds?:number}){const q=quotePwrc(input.estimatedUsd,input.pwrcUsdPrice);return{quoteId:`aiq_${crypto.randomUUID()}`,estimatedUsd:input.estimatedUsd,pwrcUsdPrice:input.pwrcUsdPrice,estimatedPwrc:q.pwrcAmount,estimatedPwrcRaw:q.pwrcRaw,expiresAt:new Date(Date.now()+(input.ttlSeconds??120)*1000).toISOString()}}
export function createCopilotMessageQuote(pricingClass:CopilotMessagePricingClass,pwrcUsdPrice=PWRC_REFERENCE_USD){const usdCharge=priceForClass(pricingClass);return{pricingClass,usdCharge,pwrcUsdPrice,...quotePwrc(usdCharge,pwrcUsdPrice)}}

export * from "./tokenized-chat";
