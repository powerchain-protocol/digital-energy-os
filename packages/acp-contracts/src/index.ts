export const POWERCHAIN_ACP_VERSION="1.0.0" as const;
export const ACP_EVENT_SCHEMA_VERSION="1.0.0" as const;

export type AcpActorType="user"|"agent"|"service";
export type AcpCommandType=
  |"acp.provider.search"
  |"acp.proposal.create"
  |"acp.proposal.approve"
  |"acp.job.create"
  |"acp.job.request_funding"
  |"acp.job.approve_funding"
  |"acp.job.fund"
  |"acp.deliverable.review"
  |"acp.deliverable.request_revision"
  |"acp.job.request_completion"
  |"acp.job.complete"
  |"acp.job.reject"
  |"acp.job.reconcile";

export interface CausalContext{
  requestId:string;
  traceId:string;
  correlationId:string;
  causationId?:string;
}

export interface AcpCommand<TPayload=Record<string,unknown>> extends CausalContext{
  id:string;
  type:AcpCommandType;
  organizationId:string;
  actor:{type:AcpActorType;id:string};
  payload:TPayload;
  idempotencyKey:string;
  expectedResourceVersion?:number;
  createdAt:string;
}

export interface Money{
  asset:"USDC";
  rawAmount:string;
  decimals:6;
  displayAmount?:string;
}
export const moneyFromRaw=(rawAmount:bigint):Money=>({asset:"USDC",rawAmount:rawAmount.toString(),decimals:6});
export const moneyRaw=(money:Money)=>BigInt(money.rawAmount);

export type CommandReceiptState="accepted"|"pending_approval"|"executing"|"completed"|"rejected"|"unknown";
export interface CommandReceipt{
  commandId:string;
  requestId:string;
  traceId:string;
  correlationId:string;
  state:CommandReceiptState;
  resourceId?:string;
  approvalId?:string;
  executionAttemptId?:string;
  createdAt:string;
}

export type AcpJobState=
  |"draft"
  |"pending_proposal_approval"
  |"proposal_approved"
  |"creating"
  |"created"
  |"pending_funding_approval"
  |"funding_authorized"
  |"funding"
  |"execution_unknown"
  |"funded"
  |"in_progress"
  |"submitted"
  |"pending_completion_approval"
  |"completion_authorized"
  |"completing"
  |"completed"
  |"revision_requested"
  |"rejected"
  |"disputed"
  |"reconciling"
  |"reconciliation_conflict"
  |"expired";


export interface AcpProposal{
  id:string;publicId:string;organizationId:string;capabilityId:string;providerId:string;providerIdentityHash:string;chainId:number;offeringName:string;
  requirements:Record<string,unknown>;requirementsHash:string;maximumBudget:Money;strategy:ProviderSelectionStrategy;status:"draft"|"pending_approval"|"approved"|"rejected"|"converted";version:number;createdBy:string;createdAt:string;updatedAt:string;
}
export interface AcpBudgetReservation{
  id:string;organizationId:string;jobId:string;authorizationId:string;amount:Money;state:"active"|"released"|"consumed";expiresAt:string;createdAt:string;releasedAt?:string;
}

export interface AcpJob{
  id:string;
  publicId:string;
  organizationId:string;
  proposalId:string;
  providerId:string;
  providerIdentityHash:string;
  externalJobId?:string;
  chainId:number;
  capabilityId:string;
  offeringName:string;
  requirements:Record<string,unknown>;
  requirementsHash:string;
  requirementsVersion:number;
  requirementsLocked:boolean;
  state:AcpJobState;
  approvedBudget:Money;
  reservedBudget:Money;
  actualSpend:Money;
  version:number;
  lastExternalEventAt?:string;
  lastReconciledAt?:string;
  createdAt:string;
  updatedAt:string;
}

export type AcpApprovalAction="create_job"|"fund_job"|"complete_job"|"reject_job"|"amend_job";
export interface ApprovalEnvelope{
  id:string;
  organizationId:string;
  resourceType:"proposal"|"job"|"treasury"|"rwa"|"sui";
  resourceId:string;
  jobId?:string;
  resourceVersion:number;
  proposalHash:string;
  providerIdentity:string;
  chainId:number;
  amount:Money;
  asset:"USDC";
  requirementsHash:string;
  policySnapshotHash:string;
  action:AcpApprovalAction;
  expiresAt:string;
  decision:"pending"|"approved"|"rejected";
  decidedBy?:string;
  decidedAt?:string;
  consumedAt?:string;
  createdAt:string;
}

export interface ExecutionAuthorization{
  id:string;
  organizationId:string;
  jobId:string;
  action:"create_job"|"fund_job"|"complete_job"|"reject_job";
  approvalId:string;
  providerIdentityHash:string;
  chainId:number;
  amount?:Money;
  requirementsHash:string;
  policySnapshotHash:string;
  resourceVersion:number;
  expiresAt:string;
  consumedAt?:string;
  createdAt:string;
}

export type ExecutionAttemptStatus="created"|"executing"|"succeeded"|"failed"|"unknown"|"reconciled";
export interface ExecutionAttempt extends CausalContext{
  id:string;
  organizationId:string;
  jobId:string;
  operation:"create_job"|"fund_job"|"complete_job"|"reject_job";
  authorizationId:string;
  idempotencyKey:string;
  status:ExecutionAttemptStatus;
  attemptNumber:number;
  startedAt?:string;
  finishedAt?:string;
  externalReference?:string;
  errorCode?:string;
  createdAt:string;
}

export interface ExecutionReceipt extends CausalContext{
  id:string;
  organizationId:string;
  jobId:string;
  attemptId:string;
  operation:ExecutionAttempt["operation"];
  externalJobId:string;
  transactionReference?:string;
  status:"confirmed"|"not_found"|"conflict";
  principal?:Money;
  networkFee?:Money;
  receivedAt:string;
}

export type PolicyReasonCode=
  |"CHAIN_NOT_ALLOWED"
  |"PROVIDER_BLOCKED"
  |"CAPABILITY_BLOCKED"
  |"BUDGET_LIMIT_EXCEEDED"
  |"APPROVAL_REQUIRED"
  |"WALLET_LIMIT_EXCEEDED"
  |"RISK_TOO_HIGH"
  |"ORGANIZATION_SUSPENDED"
  |"ACP_DISABLED";

export interface EffectiveAcpPolicy{
  hash:string;
  version:number;
  automaticSpendAllowed:false;
  allowedChains:number[];
  allowedAssets:["USDC"];
  maxJobAmount:Money;
  requiresJobApproval:boolean;
  requiresFundingApproval:true;
  requiresCompletionApproval:true;
  providerPolicy:{approvedProvidersOnly:boolean;blockedProviderIds:string[]};
  reasons:Array<{code:PolicyReasonCode;message:string}>;
  sourceVersions:Record<string,number>;
  evaluatedAt:string;
}

export interface ProviderEvaluation{
  providerId:string;
  eligible:boolean;
  eligibilityReasons:string[];
  score?:number;
  riskLevel:"low"|"medium"|"high";
  recommendation:"recommended"|"acceptable"|"not_recommended"|"ineligible";
  estimatedCost?:Money;
  estimatedDurationMinutes?:number;
}
export type ProviderSelectionStrategy="quality_first"|"balanced"|"cost_first"|"approved_providers_only";

export interface DiscoverProvidersInput{
  organizationId:string;
  query:string;
  capabilityId:string;
  allowedChains:number[];
  topK?:number;
}
export interface ExternalProvider{
  externalProviderId:string;
  walletAddress:string;
  name:string;
  identityHash:string;
  capabilities:string[];
  offerings:Array<{name:string;description?:string;requiredFunds?:boolean;slaMinutes?:number}>;
  chains:number[];
  successfulJobs?:number;
  successRate?:number;
  metadata?:Record<string,unknown>;
}

export interface AuthorizedCreateJob{
  organizationId:string;jobId:string;chainId:number;offeringName:string;providerAddress:string;evaluatorAddress:string;
  requirements:Record<string,unknown>;authorizationId:string;idempotencyKey:string;
}
export interface AuthorizedFunding{
  organizationId:string;jobId:string;externalJobId:string;providerId?:string;chainId:number;amount:Money;authorizationId:string;idempotencyKey:string;paymentReference?:string;executionAccountId?:string;
}
export interface AuthorizedCompletion{
  organizationId:string;jobId:string;externalJobId:string;providerId?:string;chainId:number;reason:string;authorizationId:string;idempotencyKey:string;
}
export interface AuthorizedRejection extends AuthorizedCompletion{}
export interface ExternalJobLookup{organizationId:string;providerId?:string;chainId:number;externalJobId:string}
export interface ExternalJobReference{externalJobId:string;chainId:number;raw?:unknown}
export type ExternalExecutionStatus="success"|"failed"|"unknown";
export interface ExternalExecutionResult{status:ExternalExecutionStatus;externalJobId:string;transactionReference?:string;result?:unknown;errorCode?:string}
export interface ExternalJobSnapshot{
  externalJobId:string;chainId:number;status:"open"|"budget_set"|"funded"|"submitted"|"completed"|"rejected"|"expired"|"unknown";
  providerAddress?:string;evaluatorAddress?:string;budgetRaw?:string;entriesCount:number;raw?:unknown;
}
export interface AgentCommerceAdapter{
  readonly version:"1.0.0";
  readonly protocolVersion:"1.0.0";
  start():Promise<void>;stop():Promise<void>;
  discoverProviders(input:DiscoverProvidersInput):Promise<ExternalProvider[]>;
  createJob(input:AuthorizedCreateJob):Promise<ExternalJobReference>;
  fundJob(input:AuthorizedFunding):Promise<ExternalExecutionResult>;
  completeJob(input:AuthorizedCompletion):Promise<ExternalExecutionResult>;
  rejectJob(input:AuthorizedRejection):Promise<ExternalExecutionResult>;
  getJob(input:ExternalJobLookup):Promise<ExternalJobSnapshot>;
  health():Promise<{state:"healthy"|"degraded"|"misconfigured";version:"1.0.0";protocolVersion:"1.0.0";checkedAt:string;reason?:string}>;
}

export type ExternalAcpEventType="job.created"|"budget.set"|"job.funded"|"job.submitted"|"job.completed"|"job.rejected"|"job.expired";
export type PowerChainExternalAcpEventType=
  |"powerchain.acp.external.job_created.v1"
  |"powerchain.acp.external.budget_observed.v1"
  |"powerchain.acp.external.funding_observed.v1"
  |"powerchain.acp.external.submission_observed.v1"
  |"powerchain.acp.external.completion_observed.v1"
  |"powerchain.acp.external.rejection_observed.v1"
  |"powerchain.acp.external.expiration_observed.v1"
  |"powerchain.acp.external.message_observed.v1";
export interface AcpEventInboxRecord{
  id:string;organizationId:string;source:"powerchain-acp";chainId:number;externalJobId:string;eventFingerprint:string;
  externalEventType?:ExternalAcpEventType;mappedEventType?:PowerChainExternalAcpEventType;payload:unknown;receivedAt:string;processedAt?:string;
  processingError?:string;attempts:number;leaseOwner?:string;leaseExpiresAt?:string;
}

export interface AcpExecutionAccount{
  id:string;organizationId:string;chainId:number;address:string;purpose:"ACP_COMMERCE_ONLY";asset:"USDC";
  state:"ACTIVE"|"READ_ONLY"|"DISABLED";dailyLimitRaw:string;spentTodayRaw:string;walletProvider:string;
}
export interface WalletSpendCheck{organizationId:string;accountId:string;chainId:number;asset:"USDC";amountRaw:string;businessReference:string}
export interface WalletReconciliation{
  accountId:string;chainId:number;confirmedBalanceRaw?:string;
  observedTransactions:Array<{reference:string;amountRaw:string;asset:string;confirmed:boolean;networkFeeRaw?:string}>;
  varianceRaw:string;observedAt:string;
}
export interface WalletExecutionResult{status:"success"|"unknown"|"failed";transactionReference?:string;networkFeeRaw?:string;errorCode?:string}
export interface AcpExecutionWalletService{
  getExecutionAccount(organizationId:string,chainId:number):Promise<AcpExecutionAccount>;
  assertSpendAllowed(input:WalletSpendCheck):Promise<void>;
  executeSpend(input:WalletSpendCheck&{recipient:string;idempotencyKey:string}):Promise<WalletExecutionResult>;
  reconcile(accountId:string):Promise<WalletReconciliation>;
}

export interface LedgerPosting{account:string;asset:"USDC";rawAmount:string;side:"debit"|"credit";memo:string}
export interface AcpLedgerJournal{
  id:string;organizationId:string;jobId:string;businessReference:string;executionAttemptId:string;executionReceiptId?:string;
  postings:LedgerPosting[];createdAt:string;
}
export interface AcpActualSpend{principal:Money;networkFee?:Money;total:Money;transactionReference?:string;executionReceiptId:string}
export type AcpReconciliationOutcome="synchronized"|"repaired_non_financial"|"financial_difference"|"execution_confirmed"|"execution_not_found"|"still_unknown"|"conflict";

export type TruthTier="T0"|"T1"|"T2"|"T3"|"T4";
export interface AcpEvidenceRecord{
  id:string;organizationId:string;jobId:string;providerId:string;contentHash:string;source:string;sourceTimestamp?:string;receivedAt:string;
  validationState:"pending"|"validated"|"rejected"|"quarantined";classification:string;truthTier:TruthTier;retentionPolicy:string;
  assetId?:string;projectId?:string;metadata:Record<string,unknown>;
}

export interface AcpIncident{
  id:string;organizationId:string;jobId?:string;severity:"low"|"medium"|"high"|"critical";type:string;status:"open"|"contained"|"resolved";
  title:string;description:string;createdAt:string;resolvedAt?:string;
}
export type AcpAccountingPeriodStatus="open"|"reconciling"|"closed"|"exception";
export interface AcpAccountingPeriod{
  id:string;organizationId:string;period:string;status:AcpAccountingPeriodStatus;reconciledJobs:number;walletVarianceRaw:string;ledgerVarianceRaw:string;
  unknownExecutions:number;openCriticalIncidents:number;closeHash?:string;openedAt:string;closedAt?:string;
}

export interface AcpAllowedAction{
  id:"request_funding"|"approve_funding"|"review_deliverable"|"request_revision"|"request_completion"|"approve_completion"|"reconcile"|"open_dispute";
  label:string;method:"POST";endpoint:string;consequential:boolean;requiresApproval:boolean;financial?:Money;
}

export interface AcpCompatibilityManifest{
  powerchainVersion:"1.0.0";applicationVersion:"1.0.0";contractsVersion:"1.0.0";kernelVersion:"1.0.0";
  databaseSchemaVersion:"1.0.0";adapterVersion:"1.0.0";adapterProtocolVersion:"1.0.0";eventSchemaVersion:"1.0.0";
}

export type RealtimeChannel=
  |"platform.status"
  |"energy.telemetry"
  |"market.quotes"
  |"settlement.status"
  |"notifications"
  |"acp.jobs"
  |"acp.approvals"
  |"acp.evidence"
  |"acp.reconciliation"
  |"acp.operations"
  |"treasury.allocations"
  |"treasury.reconciliation"
  |"treasury.close";
