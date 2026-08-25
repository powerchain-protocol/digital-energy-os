import type { ExternalProvider,ProviderEvaluation,ProviderSelectionStrategy } from "@powerchain/acp-contracts";

export interface ProviderPolicyInput{blockedProviderIds:ReadonlySet<string>;approvedProviderIds:ReadonlySet<string>;approvedOnly:boolean;maxRisk:"low"|"medium"|"high"}
const riskRank={low:0,medium:1,high:2} as const;
export function evaluateProvider(provider:ExternalProvider,input:{capabilityId:string;allowedChains:number[];policy:ProviderPolicyInput;estimatedCostRaw?:string;score?:number;riskLevel?:"low"|"medium"|"high"}):ProviderEvaluation{
  const reasons:string[]=[];const risk=input.riskLevel??"medium";
  if(input.policy.blockedProviderIds.has(provider.externalProviderId))reasons.push("PROVIDER_BLOCKED");
  if(input.policy.approvedOnly&&!input.policy.approvedProviderIds.has(provider.externalProviderId))reasons.push("PROVIDER_NOT_APPROVED");
  if(!provider.capabilities.includes(input.capabilityId)&&!provider.offerings.some(item=>item.name===input.capabilityId))reasons.push("CAPABILITY_NOT_SUPPORTED");
  if(!provider.chains.some(chain=>input.allowedChains.includes(chain)))reasons.push("CHAIN_NOT_ALLOWED");
  if(riskRank[risk]>riskRank[input.policy.maxRisk])reasons.push("RISK_TOO_HIGH");
  const eligible=!reasons.length;const score=eligible?Math.max(0,Math.min(100,input.score??Math.round((provider.successRate??.75)*100))):undefined;
  return{providerId:provider.externalProviderId,eligible,eligibilityReasons:reasons,...(score!==undefined?{score}:{}),riskLevel:risk,recommendation:!eligible?"ineligible":score!>=90?"recommended":score!>=75?"acceptable":"not_recommended",...(input.estimatedCostRaw?{estimatedCost:{asset:"USDC",rawAmount:input.estimatedCostRaw,decimals:6}}:{})};
}
export function rankEligible(evaluations:ProviderEvaluation[],strategy:ProviderSelectionStrategy){
  return evaluations.filter(item=>item.eligible).sort((a,b)=>{
    const ac=a.estimatedCost?BigInt(a.estimatedCost.rawAmount):0n,bc=b.estimatedCost?BigInt(b.estimatedCost.rawAmount):0n;
    if(strategy==="cost_first")return ac===bc?(b.score??0)-(a.score??0):ac<bc?-1:1;
    if(strategy==="quality_first")return(b.score??0)-(a.score??0);
    if(strategy==="approved_providers_only")return(b.score??0)-(a.score??0);
    const value=(item:ProviderEvaluation)=>BigInt(Math.round((item.score??0)*1000))/(item.estimatedCost?BigInt(item.estimatedCost.rawAmount)/1000n+1n:1n);
    const av=value(a),bv=value(b);return av===bv?0:av>bv?-1:1;
  });
}
