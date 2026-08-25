import { createHash } from "node:crypto";
import type { PoolClient, QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import type {
  AcpAccountingPeriod,
  AcpCommand,
  AcpEventInboxRecord,
  AcpEvidenceRecord,
  AcpIncident,
  AcpJob,
  AcpProposal,
  AcpBudgetReservation,
  ApprovalEnvelope,
  CommandReceipt,
  EffectiveAcpPolicy,
  ExecutionAttempt,
  ExecutionAuthorization,
  ExecutionReceipt,
  ExternalProvider,
  Money,
  PowerChainExternalAcpEventType,
} from "@powerchain/acp-contracts";

export type AcpDatabaseTransaction=PoolClient;
export interface RepositoryContext{organizationId:string;transaction?:AcpDatabaseTransaction}

const usdc=(raw:string):Money=>({asset:"USDC",rawAmount:raw,decimals:6});
const id=(prefix:string)=>`${prefix}_${crypto.randomUUID().replaceAll("-","")}`;
const now=()=>new Date().toISOString();
const serialize=(value:unknown):unknown=>{
  if(typeof value==="bigint")return value.toString();
  if(value instanceof Date)return value.toISOString();
  if(Array.isArray(value))return value.map(serialize);
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([k,v])=>[k,serialize(v)]));
  return value;
};
const json=(value:unknown)=>JSON.stringify(serialize(value));
export const canonicalHash=(value:unknown)=>{
  const canonical=(input:unknown):string=>{
    if(input===null||typeof input!=="object")return JSON.stringify(typeof input==="bigint"?input.toString():input);
    if(Array.isArray(input))return`[${input.map(canonical).join(",")}]`;
    const record=input as Record<string,unknown>;
    return`{${Object.keys(record).sort().map(key=>`${JSON.stringify(key)}:${canonical(record[key])}`).join(",")}}`;
  };
  return createHash("sha256").update(canonical(value)).digest("hex");
};

export async function withAcpTransaction<T>(organizationId:string,handler:(tx:PoolClient)=>Promise<T>,options:{isolation?:"serializable"|"repeatable read"|"read committed"}={}):Promise<T>{
  const client=await getPostgresPool().connect();
  try{
    await client.query("begin");
    const isolation=options.isolation??"serializable";
    await client.query(`set transaction isolation level ${isolation}`);
    await client.query("select set_config('app.current_organization_id',$1,true)",[organizationId]);
    const result=await handler(client);
    await client.query("commit");
    return result;
  }catch(error){await client.query("rollback").catch(()=>undefined);throw error}finally{client.release()}
}

async function query<Row extends QueryResultRow>(context:RepositoryContext,text:string,values:readonly unknown[]=[]){
  if(context.transaction)return context.transaction.query<Row>(text,[...values]);
  return withAcpTransaction(context.organizationId,tx=>tx.query<Row>(text,[...values]),{isolation:"read committed"});
}

interface JobRow extends QueryResultRow{
  id:string;public_id:string;organization_id:string;proposal_id:string;provider_id:string;provider_identity_hash:string;external_job_id:string|null;chain_id:number;capability_id:string;offering_name:string;
  requirements:Record<string,unknown>;requirements_hash:string;requirements_version:number;requirements_locked:boolean;state:AcpJob["state"];
  approved_budget_raw:string;reserved_budget_raw:string;actual_spend_raw:string;version:number;last_external_event_at:Date|null;last_reconciled_at:Date|null;created_at:Date;updated_at:Date;
}
function mapJob(row:JobRow):AcpJob{return{id:row.id,publicId:row.public_id,organizationId:row.organization_id,proposalId:row.proposal_id,providerId:row.provider_id,providerIdentityHash:row.provider_identity_hash,...(row.external_job_id?{externalJobId:row.external_job_id}:{}),chainId:row.chain_id,capabilityId:row.capability_id,offeringName:row.offering_name,requirements:row.requirements,requirementsHash:row.requirements_hash,requirementsVersion:row.requirements_version,requirementsLocked:row.requirements_locked,state:row.state,approvedBudget:usdc(row.approved_budget_raw),reservedBudget:usdc(row.reserved_budget_raw),actualSpend:usdc(row.actual_spend_raw),version:row.version,...(row.last_external_event_at?{lastExternalEventAt:new Date(row.last_external_event_at).toISOString()}:{}),...(row.last_reconciled_at?{lastReconciledAt:new Date(row.last_reconciled_at).toISOString()}:{}),createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()}}

export class AcpCommandRepository{
  async findByIdempotencyKey(context:RepositoryContext,idempotencyKey:string){const result=await query<{id:string;receipt:CommandReceipt|null}>(context,"select id,receipt from acp_commands where organization_id=$1 and idempotency_key=$2",[context.organizationId,idempotencyKey]);return result.rows[0]??null}
  async save(context:RepositoryContext,command:AcpCommand,status="accepted"){await query(context,`insert into acp_commands(id,organization_id,type,actor_type,actor_id,payload,idempotency_key,expected_resource_version,request_id,trace_id,correlation_id,causation_id,status,created_at) values($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12,$13,$14)`,[command.id,context.organizationId,command.type,command.actor.type,command.actor.id,json(command.payload),command.idempotencyKey,command.expectedResourceVersion??null,command.requestId,command.traceId,command.correlationId,command.causationId??null,status,command.createdAt])}
  async saveReceipt(context:RepositoryContext,commandId:string,receipt:CommandReceipt){await query(context,"update acp_commands set receipt=$3::jsonb,status=$4,updated_at=now() where organization_id=$1 and id=$2",[context.organizationId,commandId,json(receipt),receipt.state])}
}



interface ProposalRow extends QueryResultRow{id:string;public_id:string;organization_id:string;capability_id:string;provider_id:string;provider_identity_hash:string;chain_id:number;offering_name:string;requirements:Record<string,unknown>;requirements_hash:string;maximum_budget_raw:string;strategy:AcpProposal["strategy"];status:AcpProposal["status"];version:number;created_by:string;created_at:Date;updated_at:Date}
function mapProposal(row:ProposalRow):AcpProposal{return{id:row.id,publicId:row.public_id,organizationId:row.organization_id,capabilityId:row.capability_id,providerId:row.provider_id,providerIdentityHash:row.provider_identity_hash,chainId:row.chain_id,offeringName:row.offering_name,requirements:row.requirements,requirementsHash:row.requirements_hash,maximumBudget:usdc(row.maximum_budget_raw),strategy:row.strategy,status:row.status,version:row.version,createdBy:row.created_by,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString()}}
export class AcpProposalRepository{
  async create(context:RepositoryContext,proposal:AcpProposal){const result=await query<ProposalRow>(context,`insert into acp_proposals(id,public_id,organization_id,capability_id,provider_id,provider_identity_hash,chain_id,offering_name,requirements,requirements_hash,maximum_budget_raw,strategy,status,version,created_by,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14,$15,$16,$17) returning *`,[proposal.id,proposal.publicId,context.organizationId,proposal.capabilityId,proposal.providerId,proposal.providerIdentityHash,proposal.chainId,proposal.offeringName,json(proposal.requirements),proposal.requirementsHash,proposal.maximumBudget.rawAmount,proposal.strategy,proposal.status,proposal.version,proposal.createdBy,proposal.createdAt,proposal.updatedAt]);return mapProposal(result.rows[0]!)}
  async find(context:RepositoryContext,proposalId:string,lock=false){if(lock&&!context.transaction)throw new Error("ACP_PROPOSAL_LOCK_REQUIRES_TRANSACTION");const result=lock?await context.transaction!.query<ProposalRow>("select * from acp_proposals where organization_id=$1 and (id=$2 or public_id=$2) for update",[context.organizationId,proposalId]):await query<ProposalRow>(context,"select * from acp_proposals where organization_id=$1 and (id=$2 or public_id=$2)",[context.organizationId,proposalId]);return result.rows[0]?mapProposal(result.rows[0]):null}
  async save(context:RepositoryContext,proposal:AcpProposal,expectedVersion:number){const result=await query<ProposalRow>(context,`update acp_proposals set status=$4,version=$5,updated_at=$6 where organization_id=$1 and id=$2 and version=$3 returning *`,[context.organizationId,proposal.id,expectedVersion,proposal.status,proposal.version,proposal.updatedAt]);if(result.rowCount!==1)throw Object.assign(new Error("ACP proposal version conflict"),{code:"ACP_PROPOSAL_VERSION_CONFLICT"});return mapProposal(result.rows[0]!)}
  async list(context:RepositoryContext,limit=100){const result=await query<ProposalRow>(context,"select * from acp_proposals where organization_id=$1 order by updated_at desc limit $2",[context.organizationId,Math.max(1,Math.min(limit,500))]);return result.rows.map(mapProposal)}
}

interface BudgetReservationRow extends QueryResultRow{id:string;organization_id:string;job_id:string;authorization_id:string;amount_raw:string;asset:string;state:AcpBudgetReservation["state"];expires_at:Date;created_at:Date;released_at:Date|null}
function mapBudgetReservation(row:BudgetReservationRow):AcpBudgetReservation{return{id:row.id,organizationId:row.organization_id,jobId:row.job_id,authorizationId:row.authorization_id,amount:usdc(row.amount_raw),state:row.state,expiresAt:new Date(row.expires_at).toISOString(),createdAt:new Date(row.created_at).toISOString(),...(row.released_at?{releasedAt:new Date(row.released_at).toISOString()}: {})}}
export class AcpBudgetReservationRepository{
  async create(context:RepositoryContext,input:{jobId:string;authorizationId:string;amount:Money;expiresAt:string}){const result=await query<BudgetReservationRow>(context,`insert into acp_budget_reservations(id,organization_id,job_id,authorization_id,amount_raw,asset,state,expires_at) values($1,$2,$3,$4,$5,'USDC','active',$6) returning *`,[id("abr"),context.organizationId,input.jobId,input.authorizationId,input.amount.rawAmount,input.expiresAt]);return mapBudgetReservation(result.rows[0]!)}
  async consume(context:RepositoryContext,authorizationId:string){const result=await query<BudgetReservationRow>(context,`update acp_budget_reservations set state='consumed' where organization_id=$1 and authorization_id=$2 and state='active' returning *`,[context.organizationId,authorizationId]);return result.rows[0]?mapBudgetReservation(result.rows[0]):null}
  async releaseExpired(limit=100){const result=await getPostgresPool().query<BudgetReservationRow>(`update acp_budget_reservations set state='released',released_at=now() where id in (select id from acp_budget_reservations where state='active' and expires_at<=now() order by expires_at limit $1 for update skip locked) returning *`,[Math.max(1,Math.min(limit,500))]);return result.rows.map(mapBudgetReservation)}
}

export class AcpJobRepository{
  async find(context:RepositoryContext,jobId:string){const result=await query<JobRow>(context,"select * from acp_jobs where organization_id=$1 and (id=$2 or public_id=$2)",[context.organizationId,jobId]);return result.rows[0]?mapJob(result.rows[0]):null}
  async lock(context:RepositoryContext,jobId:string){if(!context.transaction)throw new Error("ACP_JOB_LOCK_REQUIRES_TRANSACTION");const result=await context.transaction.query<JobRow>("select * from acp_jobs where organization_id=$1 and (id=$2 or public_id=$2) for update",[context.organizationId,jobId]);return result.rows[0]?mapJob(result.rows[0]):null}
  async findByExternalJob(chainId:number,externalJobId:string){const result=await getPostgresPool().query<JobRow>("select * from acp_jobs where chain_id=$1 and external_job_id=$2 limit 1",[chainId,externalJobId]);return result.rows[0]?mapJob(result.rows[0]):null}
  async list(context:RepositoryContext,input:{states?:string[];limit?:number}={}){const limit=Math.max(1,Math.min(input.limit??100,500));const result=input.states?.length?await query<JobRow>(context,"select * from acp_jobs where organization_id=$1 and state=any($2::text[]) order by updated_at desc limit $3",[context.organizationId,input.states,limit]):await query<JobRow>(context,"select * from acp_jobs where organization_id=$1 order by updated_at desc limit $2",[context.organizationId,limit]);return result.rows.map(mapJob)}
  async create(context:RepositoryContext,job:AcpJob){const result=await query<JobRow>(context,`insert into acp_jobs(id,public_id,organization_id,proposal_id,provider_id,provider_identity_hash,external_job_id,chain_id,capability_id,offering_name,requirements,requirements_hash,requirements_version,requirements_locked,state,approved_budget_raw,reserved_budget_raw,actual_spend_raw,version,last_external_event_at,last_reconciled_at,created_at,updated_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) returning *`,[job.id,job.publicId,context.organizationId,job.proposalId,job.providerId,job.providerIdentityHash,job.externalJobId??null,job.chainId,job.capabilityId,job.offeringName,json(job.requirements),job.requirementsHash,job.requirementsVersion,job.requirementsLocked,job.state,job.approvedBudget.rawAmount,job.reservedBudget.rawAmount,job.actualSpend.rawAmount,job.version,job.lastExternalEventAt??null,job.lastReconciledAt??null,job.createdAt,job.updatedAt]);return mapJob(result.rows[0]!)}
  async save(context:RepositoryContext,job:AcpJob,expectedVersion:number){const result=await query<JobRow>(context,`update acp_jobs set external_job_id=$4,requirements=$5::jsonb,requirements_hash=$6,requirements_version=$7,requirements_locked=$8,state=$9,approved_budget_raw=$10,reserved_budget_raw=$11,actual_spend_raw=$12,version=$13,last_external_event_at=$14,last_reconciled_at=$15,updated_at=$16 where organization_id=$1 and id=$2 and version=$3 returning *`,[context.organizationId,job.id,expectedVersion,job.externalJobId??null,json(job.requirements),job.requirementsHash,job.requirementsVersion,job.requirementsLocked,job.state,job.approvedBudget.rawAmount,job.reservedBudget.rawAmount,job.actualSpend.rawAmount,job.version,job.lastExternalEventAt??null,job.lastReconciledAt??null,job.updatedAt]);if(result.rowCount!==1)throw Object.assign(new Error("ACP job version conflict"),{code:"ACP_JOB_VERSION_CONFLICT"});return mapJob(result.rows[0]!)}
}

interface ApprovalRow extends QueryResultRow{id:string;organization_id:string;resource_type:ApprovalEnvelope["resourceType"];resource_id:string;job_id:string|null;resource_version:number;proposal_hash:string;provider_identity:string;chain_id:number;amount_raw:string;asset:string;requirements_hash:string;policy_snapshot_hash:string;action:ApprovalEnvelope["action"];expires_at:Date;decision:ApprovalEnvelope["decision"];decided_by:string|null;decided_at:Date|null;consumed_at:Date|null;created_at:Date}
function mapApproval(row:ApprovalRow):ApprovalEnvelope{return{id:row.id,organizationId:row.organization_id,resourceType:row.resource_type,resourceId:row.resource_id,...(row.job_id?{jobId:row.job_id}:{}),resourceVersion:row.resource_version,proposalHash:row.proposal_hash,providerIdentity:row.provider_identity,chainId:row.chain_id,amount:usdc(row.amount_raw),asset:"USDC",requirementsHash:row.requirements_hash,policySnapshotHash:row.policy_snapshot_hash,action:row.action,expiresAt:new Date(row.expires_at).toISOString(),decision:row.decision,...(row.decided_by?{decidedBy:row.decided_by}:{}),...(row.decided_at?{decidedAt:new Date(row.decided_at).toISOString()}:{}),...(row.consumed_at?{consumedAt:new Date(row.consumed_at).toISOString()}:{}),createdAt:new Date(row.created_at).toISOString()}}
export class AcpApprovalRepository{
  async create(context:RepositoryContext,approval:ApprovalEnvelope){const result=await query<ApprovalRow>(context,`insert into acp_approvals(id,organization_id,resource_type,resource_id,job_id,resource_version,proposal_hash,provider_identity,chain_id,amount_raw,asset,requirements_hash,policy_snapshot_hash,action,expires_at,decision,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) returning *`,[approval.id,context.organizationId,approval.resourceType,approval.resourceId,approval.jobId??null,approval.resourceVersion,approval.proposalHash,approval.providerIdentity,approval.chainId,approval.amount.rawAmount,approval.asset,approval.requirementsHash,approval.policySnapshotHash,approval.action,approval.expiresAt,approval.decision,approval.createdAt]);return mapApproval(result.rows[0]!)}
  async find(context:RepositoryContext,approvalId:string,lock=false){if(lock&&!context.transaction)throw new Error("ACP_APPROVAL_LOCK_REQUIRES_TRANSACTION");const result=lock?await context.transaction!.query<ApprovalRow>("select * from acp_approvals where organization_id=$1 and id=$2 for update",[context.organizationId,approvalId]):await query<ApprovalRow>(context,"select * from acp_approvals where organization_id=$1 and id=$2",[context.organizationId,approvalId]);return result.rows[0]?mapApproval(result.rows[0]):null}
  async decide(context:RepositoryContext,approvalId:string,decision:"approved"|"rejected",actorId:string){const result=await query<ApprovalRow>(context,`update acp_approvals set decision=$3,decided_by=$4,decided_at=now() where organization_id=$1 and id=$2 and decision='pending' and expires_at>now() returning *`,[context.organizationId,approvalId,decision,actorId]);if(result.rowCount!==1)throw Object.assign(new Error("Approval is unavailable, expired, or already decided"),{code:"ACP_APPROVAL_DECISION_CONFLICT"});return mapApproval(result.rows[0]!)}
  async consume(context:RepositoryContext,approvalId:string){const result=await query<ApprovalRow>(context,`update acp_approvals set consumed_at=now() where organization_id=$1 and id=$2 and decision='approved' and consumed_at is null and expires_at>now() returning *`,[context.organizationId,approvalId]);if(result.rowCount!==1)throw Object.assign(new Error("Approval is not consumable"),{code:"ACP_APPROVAL_REPLAY"});return mapApproval(result.rows[0]!)}
  async pending(context:RepositoryContext,limit=100){const result=await query<ApprovalRow>(context,"select * from acp_approvals where organization_id=$1 and decision='pending' and expires_at>now() order by created_at asc limit $2",[context.organizationId,Math.max(1,Math.min(limit,500))]);return result.rows.map(mapApproval)}
  async list(context:RepositoryContext,limit=200){const result=await query<ApprovalRow>(context,"select * from acp_approvals where organization_id=$1 order by created_at desc limit $2",[context.organizationId,Math.max(1,Math.min(limit,500))]);return result.rows.map(mapApproval)}
}

export class AcpPolicySnapshotRepository{
  async save(context:RepositoryContext,jobId:string|undefined,action:string,policy:EffectiveAcpPolicy){const snapshotId=id("aps");await query(context,`insert into acp_policy_snapshots(id,organization_id,job_id,action,version,policy_hash,policy,created_at) values($1,$2,$3,$4,$5,$6,$7::jsonb,$8) on conflict(organization_id,policy_hash) do nothing`,[snapshotId,context.organizationId,jobId??null,action,policy.version,policy.hash,json(policy),policy.evaluatedAt]);return policy}
}

interface AuthorizationRow extends QueryResultRow{id:string;organization_id:string;job_id:string;action:ExecutionAuthorization["action"];approval_id:string;provider_identity_hash:string;chain_id:number;amount_raw:string|null;requirements_hash:string;policy_snapshot_hash:string;resource_version:number;expires_at:Date;consumed_at:Date|null;created_at:Date}
function mapAuthorization(row:AuthorizationRow):ExecutionAuthorization{return{id:row.id,organizationId:row.organization_id,jobId:row.job_id,action:row.action,approvalId:row.approval_id,providerIdentityHash:row.provider_identity_hash,chainId:row.chain_id,...(row.amount_raw?{amount:usdc(row.amount_raw)}:{}),requirementsHash:row.requirements_hash,policySnapshotHash:row.policy_snapshot_hash,resourceVersion:row.resource_version,expiresAt:new Date(row.expires_at).toISOString(),...(row.consumed_at?{consumedAt:new Date(row.consumed_at).toISOString()}:{}),createdAt:new Date(row.created_at).toISOString()}}
export class AcpExecutionAuthorizationRepository{
  async create(context:RepositoryContext,authorization:ExecutionAuthorization){const result=await query<AuthorizationRow>(context,`insert into acp_execution_authorizations(id,organization_id,job_id,action,approval_id,provider_identity_hash,chain_id,amount_raw,requirements_hash,policy_snapshot_hash,resource_version,expires_at,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *`,[authorization.id,context.organizationId,authorization.jobId,authorization.action,authorization.approvalId,authorization.providerIdentityHash,authorization.chainId,authorization.amount?.rawAmount??null,authorization.requirementsHash,authorization.policySnapshotHash,authorization.resourceVersion,authorization.expiresAt,authorization.createdAt]);return mapAuthorization(result.rows[0]!)}
  async consume(context:RepositoryContext,authorizationId:string){const result=await query<AuthorizationRow>(context,`update acp_execution_authorizations set consumed_at=now() where organization_id=$1 and id=$2 and consumed_at is null and expires_at>now() returning *`,[context.organizationId,authorizationId]);if(result.rowCount!==1)throw Object.assign(new Error("Execution authorization is expired or already consumed"),{code:"ACP_EXECUTION_AUTHORIZATION_REPLAY"});return mapAuthorization(result.rows[0]!)}
}

interface AttemptRow extends QueryResultRow{id:string;organization_id:string;job_id:string;operation:ExecutionAttempt["operation"];authorization_id:string;idempotency_key:string;status:ExecutionAttempt["status"];attempt_number:number;started_at:Date|null;finished_at:Date|null;external_reference:string|null;error_code:string|null;request_id:string;trace_id:string;correlation_id:string;causation_id:string|null;created_at:Date}
function mapAttempt(row:AttemptRow):ExecutionAttempt{return{id:row.id,organizationId:row.organization_id,jobId:row.job_id,operation:row.operation,authorizationId:row.authorization_id,idempotencyKey:row.idempotency_key,status:row.status,attemptNumber:row.attempt_number,...(row.started_at?{startedAt:new Date(row.started_at).toISOString()}:{}),...(row.finished_at?{finishedAt:new Date(row.finished_at).toISOString()}:{}),...(row.external_reference?{externalReference:row.external_reference}:{}),...(row.error_code?{errorCode:row.error_code}:{}),requestId:row.request_id,traceId:row.trace_id,correlationId:row.correlation_id,...(row.causation_id?{causationId:row.causation_id}:{}),createdAt:new Date(row.created_at).toISOString()}}
export class AcpExecutionAttemptRepository{
  async listForJob(context:RepositoryContext,jobId:string){const result=await query<AttemptRow>(context,"select * from acp_execution_attempts where organization_id=$1 and job_id=$2 order by created_at desc",[context.organizationId,jobId]);return result.rows.map(mapAttempt)}
  async create(context:RepositoryContext,input:Omit<ExecutionAttempt,"id"|"attemptNumber"|"createdAt">){const count=await query<{next:string}>(context,"select (coalesce(max(attempt_number),0)+1)::text next from acp_execution_attempts where organization_id=$1 and job_id=$2 and operation=$3",[context.organizationId,input.jobId,input.operation]);const attempt:ExecutionAttempt={...input,id:id("att"),attemptNumber:Number(count.rows[0]?.next??1),createdAt:now()};const result=await query<AttemptRow>(context,`insert into acp_execution_attempts(id,organization_id,job_id,operation,authorization_id,idempotency_key,status,attempt_number,started_at,finished_at,external_reference,error_code,request_id,trace_id,correlation_id,causation_id,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) returning *`,[attempt.id,context.organizationId,attempt.jobId,attempt.operation,attempt.authorizationId,attempt.idempotencyKey,attempt.status,attempt.attemptNumber,attempt.startedAt??null,attempt.finishedAt??null,attempt.externalReference??null,attempt.errorCode??null,attempt.requestId,attempt.traceId,attempt.correlationId,attempt.causationId??null,attempt.createdAt]);return mapAttempt(result.rows[0]!)}
  async updateStatus(context:RepositoryContext,attemptId:string,status:ExecutionAttempt["status"],patch:{externalReference?:string;errorCode?:string}={}){const result=await query<AttemptRow>(context,`update acp_execution_attempts set status=$3,started_at=coalesce(started_at,case when $3='executing' then now() else null end),finished_at=case when $3 in ('succeeded','failed','reconciled') then now() else finished_at end,external_reference=coalesce($4,external_reference),error_code=coalesce($5,error_code) where organization_id=$1 and id=$2 returning *`,[context.organizationId,attemptId,status,patch.externalReference??null,patch.errorCode??null]);if(!result.rows[0])throw Object.assign(new Error("Execution attempt not found"),{code:"ACP_EXECUTION_ATTEMPT_NOT_FOUND"});return mapAttempt(result.rows[0])}
  async unknown(context:RepositoryContext,limit=100){const result=await query<AttemptRow>(context,"select * from acp_execution_attempts where organization_id=$1 and status='unknown' order by created_at asc limit $2",[context.organizationId,Math.max(1,Math.min(limit,500))]);return result.rows.map(mapAttempt)}
}

interface ReceiptRow extends QueryResultRow{id:string;organization_id:string;job_id:string;attempt_id:string;operation:ExecutionReceipt["operation"];external_job_id:string;transaction_reference:string|null;status:ExecutionReceipt["status"];principal_raw:string|null;network_fee_raw:string|null;request_id:string;trace_id:string;correlation_id:string;causation_id:string|null;received_at:Date}
function mapReceipt(row:ReceiptRow):ExecutionReceipt{return{id:row.id,organizationId:row.organization_id,jobId:row.job_id,attemptId:row.attempt_id,operation:row.operation,externalJobId:row.external_job_id,...(row.transaction_reference?{transactionReference:row.transaction_reference}:{}),status:row.status,...(row.principal_raw?{principal:usdc(row.principal_raw)}:{}),...(row.network_fee_raw?{networkFee:usdc(row.network_fee_raw)}:{}),requestId:row.request_id,traceId:row.trace_id,correlationId:row.correlation_id,...(row.causation_id?{causationId:row.causation_id}:{}),receivedAt:new Date(row.received_at).toISOString()}}
export class AcpExecutionReceiptRepository{
  async create(context:RepositoryContext,input:Omit<ExecutionReceipt,"id"|"receivedAt">){const result=await query<ReceiptRow>(context,`insert into acp_execution_receipts(id,organization_id,job_id,attempt_id,operation,external_job_id,transaction_reference,status,principal_raw,network_fee_raw,request_id,trace_id,correlation_id,causation_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,[id("rcp"),context.organizationId,input.jobId,input.attemptId,input.operation,input.externalJobId,input.transactionReference??null,input.status,input.principal?.rawAmount??null,input.networkFee?.rawAmount??null,input.requestId,input.traceId,input.correlationId,input.causationId??null]);return mapReceipt(result.rows[0]!)}
  async forAttempt(context:RepositoryContext,attemptId:string){const result=await query<ReceiptRow>(context,"select * from acp_execution_receipts where organization_id=$1 and attempt_id=$2",[context.organizationId,attemptId]);return result.rows[0]?mapReceipt(result.rows[0]):null}
}

export class AcpEventInboxRepository{
  async receive(context:RepositoryContext,input:Omit<AcpEventInboxRecord,"id"|"organizationId"|"attempts">){const eventId=id("aci");const result=await query<{id:string}>(context,`insert into acp_event_inbox(id,organization_id,source,chain_id,external_job_id,event_fingerprint,external_event_type,mapped_event_type,payload,received_at,attempts) values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,0) on conflict(source,chain_id,external_job_id,event_fingerprint) do nothing returning id`,[eventId,context.organizationId,input.source,input.chainId,input.externalJobId,input.eventFingerprint,input.externalEventType??null,input.mappedEventType??null,json(input.payload),input.receivedAt]);return result.rows[0]?.id??null}
  async claimBatch(workerId:string,limit=100,leaseSeconds=60){const client=await getPostgresPool().connect();try{await client.query("begin");const result=await client.query<({organization_id:string}&QueryResultRow)>(`select * from acp_event_inbox where processed_at is null and (lease_expires_at is null or lease_expires_at<now()) order by received_at for update skip locked limit $1`,[Math.max(1,Math.min(limit,500))]);const ids=result.rows.map(row=>String(row.id));if(ids.length)await client.query(`update acp_event_inbox set lease_owner=$1,lease_expires_at=now()+($2::text||' seconds')::interval,attempts=attempts+1 where id=any($3::text[])`,[workerId,String(leaseSeconds),ids]);await client.query("commit");return result.rows}catch(error){await client.query("rollback");throw error}finally{client.release()}}
  async complete(idValue:string){await getPostgresPool().query("update acp_event_inbox set processed_at=now(),lease_owner=null,lease_expires_at=null,processing_error=null where id=$1",[idValue])}
  async fail(idValue:string,message:string){await getPostgresPool().query("update acp_event_inbox set lease_owner=null,lease_expires_at=null,processing_error=$2 where id=$1",[idValue,message.slice(0,1000)])}
}



export class AcpOrphanEventRepository{
  async receive(input:{source:string;chainId:number;externalJobId:string;eventFingerprint:string;externalEventType?:string;mappedEventType?:string;payload:unknown;receivedAt:string}){const eventId=id("aco");const result=await getPostgresPool().query<{id:string}>(`insert into acp_event_orphans(id,source,chain_id,external_job_id,event_fingerprint,external_event_type,mapped_event_type,payload,received_at) values($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9) on conflict(source,chain_id,external_job_id,event_fingerprint) do nothing returning id`,[eventId,input.source,input.chainId,input.externalJobId,input.eventFingerprint,input.externalEventType??null,input.mappedEventType??null,json(input.payload),input.receivedAt]);return result.rows[0]?.id??null}
  async unresolved(limit=100){const result=await getPostgresPool().query<QueryResultRow>(`select * from acp_event_orphans where resolved_at is null order by received_at asc limit $1`,[Math.max(1,Math.min(limit,500))]);return result.rows}
  async resolve(orphanId:string,organizationId:string){await getPostgresPool().query(`update acp_event_orphans set resolved_organization_id=$2,resolved_at=now(),attempts=attempts+1,last_error=null where id=$1`,[orphanId,organizationId])}
  async fail(orphanId:string,message:string){await getPostgresPool().query(`update acp_event_orphans set attempts=attempts+1,last_error=$2 where id=$1`,[orphanId,message.slice(0,1000)])}
}

export class AcpOutboxRepository{
  async append(context:RepositoryContext,input:{topic:string;aggregateType:string;aggregateId:string;payload:unknown;requestId:string;traceId:string;correlationId:string;causationId?:string}){const eventId=id("aco");await query(context,`insert into acp_outbox(id,organization_id,topic,aggregate_type,aggregate_id,payload,request_id,trace_id,correlation_id,causation_id) values($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)`,[eventId,context.organizationId,input.topic,input.aggregateType,input.aggregateId,json(input.payload),input.requestId,input.traceId,input.correlationId,input.causationId??null]);return eventId}
  async claimBatch(workerId:string,limit=100,leaseSeconds=60){const client=await getPostgresPool().connect();try{await client.query("begin");const result=await client.query<QueryResultRow>(`select * from acp_outbox where state='pending' and next_attempt_at<=now() and (lease_expires_at is null or lease_expires_at<now()) order by created_at for update skip locked limit $1`,[Math.max(1,Math.min(limit,500))]);const ids=result.rows.map(row=>String(row.id));if(ids.length)await client.query(`update acp_outbox set lease_owner=$1,lease_expires_at=now()+($2::text||' seconds')::interval,attempts=attempts+1 where id=any($3::text[])`,[workerId,String(leaseSeconds),ids]);await client.query("commit");return result.rows}catch(error){await client.query("rollback");throw error}finally{client.release()}}
  async published(idValue:string){await getPostgresPool().query("update acp_outbox set state='published',published_at=now(),lease_owner=null,lease_expires_at=null,last_error=null where id=$1",[idValue])}
  async retry(idValue:string,attempts:number,message:string){const delay=Math.min(3600,Math.max(5,2**Math.min(attempts,10)));await getPostgresPool().query(`update acp_outbox set lease_owner=null,lease_expires_at=null,last_error=$2,next_attempt_at=now()+($3::text||' seconds')::interval where id=$1`,[idValue,message.slice(0,1000),String(delay)])}
}

export class AcpProviderCacheRepository{
  async replace(context:RepositoryContext,capabilityId:string,providers:ExternalProvider[],ttlSeconds=300){if(!context.transaction)return withAcpTransaction(context.organizationId,tx=>this.replace({...context,transaction:tx},capabilityId,providers,ttlSeconds));await context.transaction.query("delete from acp_provider_cache where organization_id=$1 and capability_id=$2",[context.organizationId,capabilityId]);for(const provider of providers)await context.transaction.query(`insert into acp_provider_cache(organization_id,provider_id,capability_id,provider,source,observed_at,expires_at) values($1,$2,$3,$4::jsonb,'powerchain-acp',now(),now()+($5::text||' seconds')::interval)`,[context.organizationId,provider.externalProviderId,capabilityId,json(provider),String(ttlSeconds)]);return providers}
  async get(context:RepositoryContext,capabilityId:string,{allowStale=false}:{allowStale?:boolean}={}){const result=await query<{provider:ExternalProvider;expires_at:Date}>(context,`select provider,expires_at from acp_provider_cache where organization_id=$1 and capability_id=$2 ${allowStale?"":"and expires_at>now()"} order by observed_at desc`,[context.organizationId,capabilityId]);return{providers:result.rows.map(row=>row.provider),stale:result.rows.some(row=>new Date(row.expires_at).getTime()<=Date.now())}}
}

export class AcpEvidenceRepository{
  async append(context:RepositoryContext,input:Omit<AcpEvidenceRecord,"id"|"organizationId"|"receivedAt">){const evidence:AcpEvidenceRecord={...input,id:id("evi"),organizationId:context.organizationId,receivedAt:now()};await query(context,`insert into acp_evidence(id,organization_id,job_id,provider_id,content_hash,source,source_timestamp,received_at,validation_state,classification,truth_tier,retention_policy,asset_id,project_id,metadata) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb) on conflict(organization_id,job_id,content_hash) do nothing`,[evidence.id,context.organizationId,evidence.jobId,evidence.providerId,evidence.contentHash,evidence.source,evidence.sourceTimestamp??null,evidence.receivedAt,evidence.validationState,evidence.classification,evidence.truthTier,evidence.retentionPolicy,evidence.assetId??null,evidence.projectId??null,json(evidence.metadata)]);return evidence}
  async list(context:RepositoryContext,jobId:string){const result=await query<QueryResultRow>(context,"select * from acp_evidence where organization_id=$1 and job_id=$2 order by received_at desc",[context.organizationId,jobId]);return result.rows}
}

export class AcpIncidentRepository{
  async create(context:RepositoryContext,input:Omit<AcpIncident,"id"|"organizationId"|"createdAt">&{metadata?:Record<string,unknown>}){const incident:AcpIncident={id:id("inc"),organizationId:context.organizationId,createdAt:now(),...input};await query(context,`insert into acp_incidents(id,organization_id,job_id,severity,type,status,title,description,metadata,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)`,[incident.id,context.organizationId,incident.jobId??null,incident.severity,incident.type,incident.status,incident.title,incident.description,json(input.metadata??{}),incident.createdAt]);return incident}
  async open(context:RepositoryContext){const result=await query<QueryResultRow>(context,"select * from acp_incidents where organization_id=$1 and status<>'resolved' order by created_at desc",[context.organizationId]);return result.rows}
}

export class AcpAccountingPeriodRepository{
  async get(context:RepositoryContext,period:string){const result=await query<QueryResultRow>(context,"select * from acp_accounting_periods where organization_id=$1 and period=$2",[context.organizationId,period]);return result.rows[0]??null}
  async upsert(context:RepositoryContext,input:AcpAccountingPeriod){await query(context,`insert into acp_accounting_periods(id,organization_id,period,status,reconciled_jobs,wallet_variance_raw,ledger_variance_raw,unknown_executions,open_critical_incidents,close_hash,opened_at,closed_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict(organization_id,period) do update set status=excluded.status,reconciled_jobs=excluded.reconciled_jobs,wallet_variance_raw=excluded.wallet_variance_raw,ledger_variance_raw=excluded.ledger_variance_raw,unknown_executions=excluded.unknown_executions,open_critical_incidents=excluded.open_critical_incidents,close_hash=excluded.close_hash,closed_at=excluded.closed_at`,[input.id,context.organizationId,input.period,input.status,input.reconciledJobs,input.walletVarianceRaw,input.ledgerVarianceRaw,input.unknownExecutions,input.openCriticalIncidents,input.closeHash??null,input.openedAt,input.closedAt??null]);return input}
}

export class AcpAuditRepository{
  async append(context:RepositoryContext,input:{actorType:string;actorId:string;action:string;resourceType:string;resourceId?:string;reason?:string;metadata?:Record<string,unknown>;requestId:string;traceId:string;correlationId:string;causationId?:string}){const auditId=id("aud");await query(context,`insert into acp_audit_events(id,organization_id,actor_type,actor_id,action,resource_type,resource_id,reason,metadata,request_id,trace_id,correlation_id,causation_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13)`,[auditId,context.organizationId,input.actorType,input.actorId,input.action,input.resourceType,input.resourceId??null,input.reason??null,json(input.metadata??{}),input.requestId,input.traceId,input.correlationId,input.causationId??null]);return auditId}
}

export const acpRepositories={
  commands:new AcpCommandRepository(),proposals:new AcpProposalRepository(),jobs:new AcpJobRepository(),reservations:new AcpBudgetReservationRepository(),approvals:new AcpApprovalRepository(),policies:new AcpPolicySnapshotRepository(),authorizations:new AcpExecutionAuthorizationRepository(),attempts:new AcpExecutionAttemptRepository(),receipts:new AcpExecutionReceiptRepository(),inbox:new AcpEventInboxRepository(),orphans:new AcpOrphanEventRepository(),outbox:new AcpOutboxRepository(),providers:new AcpProviderCacheRepository(),evidence:new AcpEvidenceRepository(),incidents:new AcpIncidentRepository(),periods:new AcpAccountingPeriodRepository(),audit:new AcpAuditRepository(),
};

export function mapExternalAcpEventType(type:string|undefined):PowerChainExternalAcpEventType{
  switch(type){
    case"job.created":return"powerchain.acp.external.job_created.v1";
    case"budget.set":return"powerchain.acp.external.budget_observed.v1";
    case"job.funded":return"powerchain.acp.external.funding_observed.v1";
    case"job.submitted":return"powerchain.acp.external.submission_observed.v1";
    case"job.completed":return"powerchain.acp.external.completion_observed.v1";
    case"job.rejected":return"powerchain.acp.external.rejection_observed.v1";
    case"job.expired":return"powerchain.acp.external.expiration_observed.v1";
    default:return"powerchain.acp.external.message_observed.v1";
  }
}
