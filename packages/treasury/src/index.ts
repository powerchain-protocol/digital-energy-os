export const TREASURY_VERSION="1.0.0" as const;
export type TreasuryAccountType="PROVIDER_CLEARING"|"SETTLEMENT_SUSPENSE"|"WALLET_FUNDING"|"ESCROW"|"PLATFORM_REVENUE"|"ASSET_RESERVE"|"ACP_EXPENSE";
export interface TreasuryAllocationCommand{id:string;organizationId:string;sourceJournalId:string;from:TreasuryAccountType;to:TreasuryAccountType;asset:string;amountRaw:bigint;reason:string;policyHash:string;expectedSourceVersion:number;idempotencyKey:string;createdAt:string}
export interface TreasuryCommandReceipt{commandId:string;state:"PENDING_APPROVAL"|"POSTED"|"REJECTED";journalId?:string}
export function assertAllocation(command:TreasuryAllocationCommand){if(command.amountRaw<=0n)throw new Error("TREASURY_AMOUNT_INVALID");if(command.from===command.to)throw new Error("TREASURY_ACCOUNT_SAME");if(!command.reason.trim())throw new Error("TREASURY_REASON_REQUIRED")}
