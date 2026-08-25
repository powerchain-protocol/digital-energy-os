import {
  createCopilotCreditQuote,
  COPILOT_BASE_MESSAGE_USD,
  COPILOT_REAL_DATA_MESSAGE_USD,
  PWRC_REFERENCE_USD,
  type CopilotDisplayCurrency,
  type CopilotMessagePricingClass,
} from "@powerchain/credits";
import { fetchCopilotCreditRates } from "@powerchain/credits/fetch-credits";

export const DEFAULT_AI_MESSAGE_USD=COPILOT_BASE_MESSAGE_USD;
export const REAL_DATA_AI_MESSAGE_USD=COPILOT_REAL_DATA_MESSAGE_USD;
export const INITIAL_PWRC_USD=PWRC_REFERENCE_USD;

export async function getCopilotCreditQuote(pricingClass:CopilotMessagePricingClass,displayCurrency:CopilotDisplayCurrency="USD"){
  const rates=await fetchCopilotCreditRates();
  return createCopilotCreditQuote({
    pricingClass,
    displayCurrency,
    pwrcUsdPrice:PWRC_REFERENCE_USD,
    pwrcPriceSource:"policy-reference",
    ...(rates.solUsd?{solUsdPrice:rates.solUsd.price,solPriceSource:rates.solUsd.source}:{}),
    ...(rates.eurUsd?{eurUsdPrice:rates.eurUsd.price,eurPriceSource:rates.eurUsd.source}:{}),
  });
}
export function pricingClassForWorkspace(input:{sourceMode?:string;pageContext?:unknown}){return input.sourceMode&&input.sourceMode!=="UNCONFIGURED"?"REAL_DATA" as const:"BASE" as const}
