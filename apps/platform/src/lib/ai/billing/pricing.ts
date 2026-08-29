import {COPILOT_BASE_MESSAGE_USD,COPILOT_REAL_DATA_MESSAGE_USD,PWRC_REFERENCE_USD,createCopilotMessageQuote,quotePwrc} from "@powerchain/credits";
export const DEFAULT_AI_MESSAGE_USD=COPILOT_BASE_MESSAGE_USD;
export const REAL_DATA_AI_MESSAGE_USD=COPILOT_REAL_DATA_MESSAGE_USD;
export const INITIAL_PWRC_USD=PWRC_REFERENCE_USD;
export function getDefaultAiQuote(){return createCopilotMessageQuote("BASE",INITIAL_PWRC_USD)}
export function getRealDataAiQuote(){return createCopilotMessageQuote("REAL_DATA",INITIAL_PWRC_USD)}
export function calculatePwrcCharge(usdCharge:string,pwrcUsdPrice:string){return quotePwrc(usdCharge,pwrcUsdPrice).pwrcAmount}
