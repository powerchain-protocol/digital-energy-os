import type { CopilotCreditQuote,CopilotDisplayCurrency,CopilotMessagePricingClass } from "./types";

export const PWRC_DECIMALS=9 as const;
export const PWRC_REFERENCE_USD="0.000002" as const;
export const COPILOT_BASE_MESSAGE_USD="0.020" as const;
export const COPILOT_REAL_DATA_MESSAGE_USD="0.015" as const;
const INTERNAL_DECIMALS=12;

function assertDecimal(value:string){if(!/^\d+(\.\d+)?$/.test(value))throw new Error(`Invalid decimal amount: ${value}`)}
export function decimalToUnits(value:string,decimals:number):bigint{assertDecimal(value);const [whole,fraction=""]=value.split(".");const padded=(fraction+"0".repeat(decimals)).slice(0,decimals);return BigInt(whole)*10n**BigInt(decimals)+BigInt(padded||"0")}
export function unitsToDecimal(value:bigint,decimals:number){const negative=value<0n;const absolute=negative?-value:value;const scale=10n**BigInt(decimals);const whole=absolute/scale;const fraction=(absolute%scale).toString().padStart(decimals,"0").replace(/0+$/,'');return `${negative?'-':''}${fraction?`${whole}.${fraction}`:whole.toString()}`}
export function divideDecimal(numerator:string,denominator:string,outputDecimals=9){const n=decimalToUnits(numerator,INTERNAL_DECIMALS),d=decimalToUnits(denominator,INTERNAL_DECIMALS);if(d<=0n)throw new Error("Denominator must be positive");const raw=n*10n**BigInt(outputDecimals)/d;return unitsToDecimal(raw,outputDecimals)}
export function multiplyDecimal(a:string,b:string,outputDecimals=6){const aa=decimalToUnits(a,INTERNAL_DECIMALS),bb=decimalToUnits(b,INTERNAL_DECIMALS);const raw=(aa*bb)/(10n**BigInt(INTERNAL_DECIMALS));return unitsToDecimal(raw,INTERNAL_DECIMALS).split('.').map((v,i)=>i? v.slice(0,outputDecimals):v).join('.').replace(/\.$/,'')}
export function quotePwrc(usdCharge:string,pwrcUsdPrice:string){const amount=divideDecimal(usdCharge,pwrcUsdPrice,PWRC_DECIMALS);return{pwrcAmount:amount,pwrcRaw:decimalToUnits(amount,PWRC_DECIMALS).toString()}}
export function priceForClass(pricingClass:CopilotMessagePricingClass){return pricingClass==="REAL_DATA"?COPILOT_REAL_DATA_MESSAGE_USD:COPILOT_BASE_MESSAGE_USD}
export function usdToEur(usd:string,eurUsd:string,decimals=6){return divideDecimal(usd,eurUsd,decimals)}
export function usdToSol(usd:string,solUsd:string,decimals=9){return divideDecimal(usd,solUsd,decimals)}
export function amountForCurrency(input:{currency:CopilotDisplayCurrency;usdCharge:string;eurUsd?:string;solUsd?:string;pwrcAmount:string}){
 switch(input.currency){
  case 'USD':return input.usdCharge;
  case 'EUR':return input.eurUsd?usdToEur(input.usdCharge,input.eurUsd,6):undefined;
  case 'SOL':return input.solUsd?usdToSol(input.usdCharge,input.solUsd,9):undefined;
  case 'PWRC':return input.pwrcAmount;
 }
}
export function createCopilotCreditQuote(input:{pricingClass:CopilotMessagePricingClass;pwrcUsdPrice?:string;pwrcPriceSource?:CopilotCreditQuote["pwrcPriceSource"];solUsdPrice?:string;solPriceSource?:string;eurUsdPrice?:string;eurPriceSource?:string;displayCurrency?:CopilotDisplayCurrency;ttlSeconds?:number}):CopilotCreditQuote{
 const usdCharge=priceForClass(input.pricingClass);const pwrcUsdPrice=input.pwrcUsdPrice??PWRC_REFERENCE_USD;const pwrc=quotePwrc(usdCharge,pwrcUsdPrice);const solEquivalent=input.solUsdPrice?usdToSol(usdCharge,input.solUsdPrice,9):undefined;const eurCharge=input.eurUsdPrice?usdToEur(usdCharge,input.eurUsdPrice,6):undefined;const displayCurrency=input.displayCurrency??'USD';const displayAmount=amountForCurrency({currency:displayCurrency,usdCharge,eurUsd:input.eurUsdPrice,solUsd:input.solUsdPrice,pwrcAmount:pwrc.pwrcAmount});const now=Date.now();return{quoteId:`pcq_${crypto.randomUUID()}`,pricingClass:input.pricingClass,usdCharge,...(eurCharge?{eurCharge}:{}),pwrcUsdPrice,pwrcPriceSource:input.pwrcPriceSource??"policy-reference",...pwrc,...(input.solUsdPrice?{solUsdPrice:input.solUsdPrice,solPriceSource:input.solPriceSource??"configured-reference",solEquivalent}:{}),...(input.eurUsdPrice?{eurUsdPrice:input.eurUsdPrice,eurPriceSource:input.eurPriceSource??"configured-reference"}:{}),displayCurrency,...(displayAmount?{displayAmount}:{}),expiresAt:new Date(now+(input.ttlSeconds??120)*1000).toISOString()}
}
export function createUsageQuote(input:{estimatedUsd:string;pwrcUsdPrice:string;ttlSeconds?:number}){const pwrc=quotePwrc(input.estimatedUsd,input.pwrcUsdPrice);return{quoteId:`pcq_${crypto.randomUUID()}`,estimatedUsd:input.estimatedUsd,pwrcUsdPrice:input.pwrcUsdPrice,estimatedPwrc:pwrc.pwrcAmount,estimatedPwrcRaw:pwrc.pwrcRaw,expiresAt:new Date(Date.now()+(input.ttlSeconds??120)*1000).toISOString()}}
