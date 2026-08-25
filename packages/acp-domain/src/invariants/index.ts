import type { AcpCommand,AcpJob,ApprovalEnvelope,EffectiveAcpPolicy,ExecutionAttempt,Money } from "@powerchain/acp-contracts";

export type AcpInvariantId=
  |"ACP-I001"|"ACP-I002"|"ACP-I003"|"ACP-I004"|"ACP-I005"|"ACP-I006"|"ACP-I007"|"ACP-I008"|"ACP-I009"|"ACP-I010";
export const INVARIANTS:Record<AcpInvariantId,string>={
  "ACP-I001":"AUTO_SPEND_PROHIBITED",
  "ACP-I002":"APPROVAL_REQUIRED",
  "ACP-I003":"APPROVAL_REPLAY",
  "ACP-I004":"PROVIDER_CHANGED",
  "ACP-I005":"BUDGET_EXCEEDED",
  "ACP-I006":"TENANT_MISMATCH",
  "ACP-I007":"INVALID_STATE_TRANSITION",
  "ACP-I008":"DUPLICATE_EXECUTION",
  "ACP-I009":"UNSUPPORTED_ASSET",
  "ACP-I010":"EXECUTION_KILL_SWITCH",
};
export class AcpInvariantError extends Error{
  constructor(readonly invariantId:AcpInvariantId,message:string,readonly details?:Record<string,unknown>){super(`${invariantId} ${INVARIANTS[invariantId]}: ${message}`);this.name="AcpInvariantError"}
}
export function assertNoAutoSpend(policy:EffectiveAcpPolicy){if(policy.automaticSpendAllowed!==false)throw new AcpInvariantError("ACP-I001","Automatic ACP spend is prohibited in v1.0.0")}
export function assertApprovalRequired(approval:ApprovalEnvelope|undefined){if(!approval||approval.decision!=="approved")throw new AcpInvariantError("ACP-I002","An approved, exact-bound approval is required")}
export function assertApprovalUnused(approval:ApprovalEnvelope){if(approval.consumedAt)throw new AcpInvariantError("ACP-I003","Approval has already been consumed",{approvalId:approval.id})}
export function assertProviderIdentityMatches(job:AcpJob,providerIdentityHash:string){if(job.providerIdentityHash!==providerIdentityHash)throw new AcpInvariantError("ACP-I004","Provider identity changed after approval",{jobProvider:job.providerIdentityHash,actualProvider:providerIdentityHash})}
export function assertSpendWithinLimit(amount:Money,limit:Money){if(amount.asset!=="USDC"||limit.asset!=="USDC")throw new AcpInvariantError("ACP-I009","Only USDC is supported");if(BigInt(amount.rawAmount)>BigInt(limit.rawAmount))throw new AcpInvariantError("ACP-I005","Requested amount exceeds approved budget",{requested:amount.rawAmount,limit:limit.rawAmount})}
export function assertTenantMatches(expected:string,actual:string){if(expected!==actual)throw new AcpInvariantError("ACP-I006","Organization boundary mismatch",{expected,actual})}
export function assertExecutionNotAlreadyCompleted(attempts:ExecutionAttempt[]){if(attempts.some(attempt=>["executing","succeeded","unknown"].includes(attempt.status)))throw new AcpInvariantError("ACP-I008","A financial execution is already active, succeeded, or ambiguous")}
export function assertSupportedAsset(asset:string){if(asset!=="USDC")throw new AcpInvariantError("ACP-I009",`Unsupported ACP financial asset ${asset}`)}
export function assertKillSwitchOff(killSwitch:boolean){if(killSwitch)throw new AcpInvariantError("ACP-I010","ACP execution kill switch is enabled")}
export function assertCommandTenant(command:AcpCommand,job:AcpJob){assertTenantMatches(command.organizationId,job.organizationId)}
