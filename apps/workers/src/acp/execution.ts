import type {
  AcpJob,
  ExecutionAuthorization,
  ExternalExecutionResult,
  ExternalJobReference,
} from "@powerchain/acp-contracts";
import { transitionJob } from "@powerchain/acp-domain";
import { acpRepositories,withAcpTransaction } from "@powerchain/database/acp";
import { PostgresPowerChainProviderDirectory } from "@powerchain/database/acp-provider-network";
import { acpExecutionWallet } from "@powerchain/wallets/acp";
import { acpAdapterGateway } from "@powerchain/acp-sdk/gateway";

const providerDirectory=new PostgresPowerChainProviderDirectory();

interface ExecutionPayload {
  organizationId:string;
  jobId:string;
  attemptId:string;
  authorization:ExecutionAuthorization;
  job:{
    id:string;
    externalJobId?:string;
    chainId:number;
    offeringName:string;
    providerId:string;
    requirements:Record<string,unknown>;
    approvedBudget:{asset:"USDC";rawAmount:string;decimals:6};
  };
  evaluatorAddress:string;
}

async function setJobState(
  organizationId:string,
  jobId:string,
  state:AcpJob["state"],
  patch:Partial<AcpJob>={},
){
  return withAcpTransaction(organizationId,async tx=>{
    const context={organizationId,transaction:tx};
    const job=await acpRepositories.jobs.lock(context,jobId);
    if(!job)throw Object.assign(new Error("ACP job not found"),{code:"ACP_JOB_NOT_FOUND"});
    const next=job.state===state
      ?{...job,...patch,lastReconciledAt:patch.lastReconciledAt??job.lastReconciledAt}
      :{...transitionJob(job,state),...patch};
    return acpRepositories.jobs.save(context,next,job.version);
  });
}

function isCreateJobUnknown(error:unknown){
  return Boolean(error&&typeof error==="object"&&"code" in error&&(error as {code?:unknown}).code==="ACP_CREATE_JOB_UNKNOWN");
}

export async function dispatchExecution(input:ExecutionPayload){
  const{organizationId,attemptId,authorization}=input;
  const context={organizationId};
  const attempt=(await acpRepositories.attempts.listForJob(context,input.jobId)).find(item=>item.id===attemptId);
  if(!attempt)throw Object.assign(new Error("Execution attempt not found"),{code:"ACP_EXECUTION_ATTEMPT_NOT_FOUND"});
  if(attempt.status!=="created")return{state:"skipped" as const,reason:`attempt_${attempt.status}`};

  // The authorization is single-use and is durably consumed before any external side effect.
  await withAcpTransaction(organizationId,async tx=>{
    const scoped={organizationId,transaction:tx};
    await acpRepositories.authorizations.consume(scoped,authorization.id);
    await acpRepositories.attempts.updateStatus(scoped,attempt.id,"executing");
  });

  try{
    if(attempt.operation==="create_job"){
      let reference:ExternalJobReference;
      try{
        reference=await acpAdapterGateway.createJob({
          organizationId,
          jobId:input.jobId,
          chainId:input.job.chainId,
          offeringName:input.job.offeringName,
          providerAddress:input.job.providerId,
          evaluatorAddress:input.evaluatorAddress,
          requirements:input.job.requirements,
          authorizationId:authorization.id,
          idempotencyKey:attempt.idempotencyKey,
        });
      }catch(error){
        if(isCreateJobUnknown(error)){
          await acpRepositories.attempts.updateStatus(context,attempt.id,"unknown",{errorCode:"ACP_CREATE_JOB_UNKNOWN"});
          await setJobState(organizationId,input.jobId,"execution_unknown");
          await acpRepositories.outbox.append(context,{
            topic:"powerchain.acp.execution.unknown.v1",
            aggregateType:"AcpExecutionAttempt",
            aggregateId:attempt.id,
            payload:{jobId:input.jobId,attemptId:attempt.id,operation:attempt.operation},
            requestId:attempt.requestId,
            traceId:attempt.traceId,
            correlationId:attempt.correlationId,
            ...(attempt.causationId?{causationId:attempt.causationId}:{}),
          });
          return{state:"unknown" as const,attemptId:attempt.id};
        }
        throw error;
      }

      if(!reference.externalJobId)throw Object.assign(new Error("External ACP job ID missing"),{code:"ACP_EXTERNAL_JOB_ID_MISSING"});
      await acpRepositories.attempts.updateStatus(context,attempt.id,"succeeded",{externalReference:reference.externalJobId});
      await setJobState(organizationId,input.jobId,"created",{externalJobId:reference.externalJobId});
      await acpRepositories.receipts.create(context,{
        organizationId,
        jobId:input.jobId,
        attemptId:attempt.id,
        operation:"create_job",
        externalJobId:reference.externalJobId,
        status:"confirmed",
        requestId:attempt.requestId,
        traceId:attempt.traceId,
        correlationId:attempt.correlationId,
        ...(attempt.causationId?{causationId:attempt.causationId}:{}),
      });
      await acpRepositories.outbox.append(context,{
        topic:"powerchain.acp.execution.dispatched.v1",
        aggregateType:"AcpExecutionAttempt",
        aggregateId:attempt.id,
        payload:{jobId:input.jobId,attemptId:attempt.id,operation:attempt.operation,status:"success",externalJobId:reference.externalJobId},
        requestId:attempt.requestId,
        traceId:attempt.traceId,
        correlationId:attempt.correlationId,
        ...(attempt.causationId?{causationId:attempt.causationId}:{}),
      });
      return{state:"dispatched" as const,attemptId:attempt.id,result:reference};
    }

    if(!input.job.externalJobId){
      throw Object.assign(new Error("External job ID is required for this execution"),{code:"ACP_EXTERNAL_JOB_ID_REQUIRED"});
    }

    let result:ExternalExecutionResult;
    if(attempt.operation==="fund_job"){
      const amount=authorization.amount??input.job.approvedBudget;
      const provider=await providerDirectory.get({organizationId,providerId:input.job.providerId});
      if(!provider)throw Object.assign(new Error("ACP provider not found for funding"),{code:"ACP_PROVIDER_NOT_FOUND"});
      const account=await acpExecutionWallet.getExecutionAccount(organizationId,input.job.chainId);
      const businessReference=`ACP:FUND:${organizationId}:${input.jobId}:${authorization.id}`;
      const walletResult=await acpExecutionWallet.executeSpend({organizationId,accountId:account.id,chainId:input.job.chainId,asset:"USDC",amountRaw:amount.rawAmount,businessReference,recipient:provider.walletAddress,idempotencyKey:`${attempt.idempotencyKey}:wallet`});
      if(walletResult.status==="unknown"){
        result={status:"unknown",externalJobId:input.job.externalJobId,errorCode:walletResult.errorCode??"ACP_WALLET_EXECUTION_UNKNOWN"};
      }else if(walletResult.status==="failed"){
        result={status:"failed",externalJobId:input.job.externalJobId,errorCode:walletResult.errorCode??"ACP_WALLET_EXECUTION_FAILED"};
      }else{
        result=await acpAdapterGateway.fundJob({
          organizationId,providerId:input.job.providerId,jobId:input.jobId,externalJobId:input.job.externalJobId,chainId:input.job.chainId,amount,authorizationId:authorization.id,idempotencyKey:attempt.idempotencyKey,paymentReference:walletResult.transactionReference,executionAccountId:account.id,
        });
        if(result.status==="success"&&!result.transactionReference)result={...result,transactionReference:walletResult.transactionReference};
      }
    }else if(attempt.operation==="complete_job"){
      result=await acpAdapterGateway.completeJob({organizationId,providerId:input.job.providerId,jobId:input.jobId,externalJobId:input.job.externalJobId,chainId:input.job.chainId,reason:"PowerChain completion approval confirmed",authorizationId:authorization.id,idempotencyKey:attempt.idempotencyKey});
    }else{
      result=await acpAdapterGateway.rejectJob({organizationId,providerId:input.job.providerId,jobId:input.jobId,externalJobId:input.job.externalJobId,chainId:input.job.chainId,reason:"PowerChain rejection authorization confirmed",authorizationId:authorization.id,idempotencyKey:attempt.idempotencyKey});
    }

    if(result.status==="unknown"){
      await acpRepositories.attempts.updateStatus(context,attempt.id,"unknown");
      await setJobState(organizationId,input.jobId,"execution_unknown");
      await acpRepositories.outbox.append(context,{
        topic:"powerchain.acp.execution.unknown.v1",
        aggregateType:"AcpExecutionAttempt",
        aggregateId:attempt.id,
        payload:{jobId:input.jobId,attemptId:attempt.id,operation:attempt.operation},
        requestId:attempt.requestId,
        traceId:attempt.traceId,
        correlationId:attempt.correlationId,
        ...(attempt.causationId?{causationId:attempt.causationId}:{}),
      });
      return{state:"unknown" as const,attemptId:attempt.id};
    }

    if(result.status==="failed"){
      throw Object.assign(new Error(result.errorCode??"ACP external execution failed"),{code:result.errorCode??"ACP_EXTERNAL_EXECUTION_FAILED"});
    }

    await acpRepositories.attempts.updateStatus(context,attempt.id,"succeeded",{
      ...(result.transactionReference?{externalReference:result.transactionReference}:{}),
    });
    // Financial/completion operations are never considered final here. Reconciliation must confirm them.
    await setJobState(organizationId,input.jobId,"reconciling");
    await acpRepositories.outbox.append(context,{
      topic:"powerchain.acp.execution.dispatched.v1",
      aggregateType:"AcpExecutionAttempt",
      aggregateId:attempt.id,
      payload:{jobId:input.jobId,attemptId:attempt.id,operation:attempt.operation,status:result.status,externalJobId:result.externalJobId},
      requestId:attempt.requestId,
      traceId:attempt.traceId,
      correlationId:attempt.correlationId,
      ...(attempt.causationId?{causationId:attempt.causationId}:{}),
    });
    return{state:"dispatched" as const,attemptId:attempt.id,result};
  }catch(error){
    const code=error&&typeof error==="object"&&"code" in error?String((error as{code?:unknown}).code):"ACP_EXTERNAL_EXECUTION_FAILED";
    await acpRepositories.attempts.updateStatus(context,attempt.id,"failed",{errorCode:code});
    await setJobState(organizationId,input.jobId,"reconciliation_conflict");
    await acpRepositories.incidents.create(context,{
      jobId:input.jobId,
      severity:"high",
      type:"execution_failure",
      status:"contained",
      title:"ACP external execution failed",
      description:error instanceof Error?error.message:"ACP external execution failed",
      metadata:{operation:attempt.operation,attemptId:attempt.id,errorCode:code},
    });
    throw error;
  }
}
