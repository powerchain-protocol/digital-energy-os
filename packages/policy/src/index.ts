import type { AcpCommand,AcpJob,EffectiveAcpPolicy,Money,PolicyReasonCode } from "@powerchain/acp-contracts";
import { acpRepositories,canonicalHash,type AcpDatabaseTransaction } from "@powerchain/database/acp";

export type AcpMode="live"|"read_only"|"disabled";
export interface ProductionAcpConfig{
  enabled:boolean;
  mode:AcpMode;
  autoSpendUsd:0;
  requireJobApproval:true;
  requireFundingApproval:true;
  requireCompletionApproval:true;
  allowedAssets:["USDC"];
  allowedChains:number[];
  solanaEnabled:boolean;
  adapter:"powerchain";
  adapterVersion:"1.0.0";
  reconciliationEnabled:true;
  dailyCloseEnabled:true;
  auditEnabled:true;
  killSwitch:boolean;
  maxJobRaw:string;
  providerCacheFallback:boolean;
}
const bool=(value:string|undefined,fallback:boolean)=>value===undefined?fallback:value==="true";
const exact=(name:string,value:string|undefined,expected:string)=>{if(value!==undefined&&value!==expected)throw new Error(`ACP_CONFIG_UNSAFE:${name} must be ${expected}`)};
export function readProductionAcpConfig(env:NodeJS.ProcessEnv=process.env):ProductionAcpConfig{
  const enabled=bool(env.POWERCHAIN_ACP_ENABLED,false);
  const mode=(env.POWERCHAIN_ACP_MODE??(enabled?"live":"disabled")) as AcpMode;
  if(!["live","read_only","disabled"].includes(mode))throw new Error("ACP_CONFIG_INVALID:POWERCHAIN_ACP_MODE");
  exact("POWERCHAIN_ACP_AUTO_SPEND_USD",env.POWERCHAIN_ACP_AUTO_SPEND_USD,"0");
  exact("POWERCHAIN_ACP_REQUIRE_JOB_APPROVAL",env.POWERCHAIN_ACP_REQUIRE_JOB_APPROVAL,"true");
  exact("POWERCHAIN_ACP_REQUIRE_FUNDING_APPROVAL",env.POWERCHAIN_ACP_REQUIRE_FUNDING_APPROVAL,"true");
  exact("POWERCHAIN_ACP_REQUIRE_COMPLETION_APPROVAL",env.POWERCHAIN_ACP_REQUIRE_COMPLETION_APPROVAL,"true");
  exact("POWERCHAIN_ACP_ALLOWED_ASSETS",env.POWERCHAIN_ACP_ALLOWED_ASSETS,"USDC");
  exact("POWERCHAIN_ACP_ADAPTER",env.POWERCHAIN_ACP_ADAPTER,"powerchain");
  exact("POWERCHAIN_ACP_ADAPTER_VERSION",env.POWERCHAIN_ACP_ADAPTER_VERSION,"1.0.0");
  exact("POWERCHAIN_ACP_RECONCILIATION_ENABLED",env.POWERCHAIN_ACP_RECONCILIATION_ENABLED,"true");
  exact("POWERCHAIN_ACP_DAILY_CLOSE_ENABLED",env.POWERCHAIN_ACP_DAILY_CLOSE_ENABLED,"true");
  const allowedChains=(env.POWERCHAIN_ACP_ALLOWED_CHAINS??"8453").split(",").map(value=>Number(value.trim())).filter(Number.isInteger);
  if(!allowedChains.length)throw new Error("ACP_CONFIG_INVALID:At least one ACP chain is required");
  const solanaEnabled=bool(env.POWERCHAIN_ACP_SOLANA_ENABLED,false);
  if(!solanaEnabled&&allowedChains.some(chain=>chain!==8453))throw new Error("ACP_CONFIG_UNSAFE:Initial ACP production policy permits Base 8453 only unless POWERCHAIN_ACP_SOLANA_ENABLED=true");
  const config:ProductionAcpConfig={enabled,mode,autoSpendUsd:0,requireJobApproval:true,requireFundingApproval:true,requireCompletionApproval:true,allowedAssets:["USDC"],allowedChains,solanaEnabled,adapter:"powerchain",adapterVersion:"1.0.0",reconciliationEnabled:true,dailyCloseEnabled:true,auditEnabled:true,killSwitch:bool(env.POWERCHAIN_ACP_KILL_SWITCH,false),maxJobRaw:env.POWERCHAIN_ACP_MAX_JOB_RAW??"500000000",providerCacheFallback:bool(env.POWERCHAIN_ACP_PROVIDER_CACHE_FALLBACK,true)};
  if(enabled&&mode==="live"&&!env.DATABASE_URL)throw new Error("ACP_CONFIG_UNSAFE:DATABASE_URL is required for live ACP");
  return config;
}
export class AcpPolicyEngine{
  constructor(readonly config:ProductionAcpConfig=readProductionAcpConfig()){}
  async evaluate(command:AcpCommand,job?:AcpJob,transaction?:AcpDatabaseTransaction):Promise<EffectiveAcpPolicy>{
    const reasons:Array<{code:PolicyReasonCode;message:string}>=[];
    if(!this.config.enabled||this.config.mode==="disabled")reasons.push({code:"ACP_DISABLED",message:"ACP is disabled for this environment"});
    if(job&&!this.config.allowedChains.includes(job.chainId))reasons.push({code:"CHAIN_NOT_ALLOWED",message:`Chain ${job.chainId} is not permitted by effective ACP policy`});
    const maxJobAmount:Money={asset:"USDC",rawAmount:this.config.maxJobRaw,decimals:6};
    if(job&&BigInt(job.approvedBudget.rawAmount)>BigInt(maxJobAmount.rawAmount))reasons.push({code:"BUDGET_LIMIT_EXCEEDED",message:"Approved job budget exceeds the ACP platform ceiling"});
    const base={version:1,automaticSpendAllowed:false as const,allowedChains:[...this.config.allowedChains],allowedAssets:["USDC"] as ["USDC"],maxJobAmount,requiresJobApproval:true,requiresFundingApproval:true as const,requiresCompletionApproval:true as const,providerPolicy:{approvedProvidersOnly:false,blockedProviderIds:[] as string[]},reasons,sourceVersions:{platform:1,environment:1,organization:1,capability:1,provider:1,job:job?.version??0,action:1},evaluatedAt:new Date().toISOString()};
    const policy:EffectiveAcpPolicy={...base,hash:canonicalHash(base)};
    await acpRepositories.policies.save({organizationId:command.organizationId,...(transaction?{transaction}:{})},job?.id,command.type,policy);
    return policy;
  }
}
