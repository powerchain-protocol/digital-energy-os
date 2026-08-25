import type { AcpLedgerJournal,LedgerPosting } from "@powerchain/acp-contracts";
import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { withAcpTransaction } from "@powerchain/database/acp";

const id=(prefix:string)=>`${prefix}_${crypto.randomUUID().replaceAll("-","")}`;
export function assertBalanced(postings:LedgerPosting[]){
  const assets=new Map<string,{debits:bigint;credits:bigint}>();
  for(const posting of postings){const current=assets.get(posting.asset)??{debits:0n,credits:0n};const amount=BigInt(posting.rawAmount);if(amount<0n)throw new Error("ACP_LEDGER_NEGATIVE_POSTING");posting.side==="debit"?current.debits+=amount:current.credits+=amount;assets.set(posting.asset,current)}
  for(const[asset,value]of assets)if(value.debits!==value.credits)throw Object.assign(new Error(`ACP ledger journal is not balanced for ${asset}`),{code:"ACP_LEDGER_UNBALANCED"});
}
export class AcpLedgerService{
  async post(input:Omit<AcpLedgerJournal,"id"|"createdAt">){assertBalanced(input.postings);return withAcpTransaction(input.organizationId,async tx=>{
    const journal:AcpLedgerJournal={...input,id:id("jrn"),createdAt:new Date().toISOString()};
    await tx.query(`insert into acp_ledger_journals(id,organization_id,job_id,business_reference,execution_attempt_id,execution_receipt_id,created_at) values($1,$2,$3,$4,$5,$6,$7)`,[journal.id,input.organizationId,input.jobId,input.businessReference,input.executionAttemptId,input.executionReceiptId??null,journal.createdAt]);
    for(const posting of input.postings)await tx.query(`insert into acp_ledger_postings(id,journal_id,account,asset,raw_amount,side,memo) values($1,$2,$3,$4,$5,$6,$7)`,[id("pst"),journal.id,posting.account,posting.asset,posting.rawAmount,posting.side,posting.memo]);
    return journal;
  })}
  async reserveBudget(input:{organizationId:string;jobId:string;attemptId:string;rawAmount:string;authorizationId:string}){return this.post({organizationId:input.organizationId,jobId:input.jobId,businessReference:`ACP:RESERVE:${input.organizationId}:${input.jobId}:${input.authorizationId}`,executionAttemptId:input.attemptId,postings:[{account:"ACP Reserved Budget",asset:"USDC",rawAmount:input.rawAmount,side:"debit",memo:"Reserve approved ACP budget"},{account:"ACP Available Budget",asset:"USDC",rawAmount:input.rawAmount,side:"credit",memo:"Reduce available ACP budget"}]})}
  async confirmFunding(input:{organizationId:string;jobId:string;attemptId:string;receiptId:string;authorizationId:string;principalRaw:string;networkFeeRaw?:string}){const postings:LedgerPosting[]=[{account:"ACP External Agent Expense",asset:"USDC",rawAmount:input.principalRaw,side:"debit",memo:"Confirmed external ACP principal"},{account:"ACP Execution Wallet",asset:"USDC",rawAmount:input.principalRaw,side:"credit",memo:"Confirmed restricted ACP wallet outflow"}];if(input.networkFeeRaw&&BigInt(input.networkFeeRaw)>0n)postings.push({account:"ACP Network Fee Expense",asset:"USDC",rawAmount:input.networkFeeRaw,side:"debit",memo:"ACP network fee"},{account:"ACP Execution Wallet",asset:"USDC",rawAmount:input.networkFeeRaw,side:"credit",memo:"Confirmed fee wallet outflow"});return this.post({organizationId:input.organizationId,jobId:input.jobId,businessReference:`ACP:FUND:${input.organizationId}:${input.jobId}:${input.authorizationId}`,executionAttemptId:input.attemptId,executionReceiptId:input.receiptId,postings})}
  async balances(organizationId:string){const result=await getPostgresPool().query<{account:string;asset:string;balance:string}>(`select p.account,p.asset,(sum(case when p.side='debit' then p.raw_amount else -p.raw_amount end))::text balance from acp_ledger_postings p join acp_ledger_journals j on j.id=p.journal_id where j.organization_id=$1 group by p.account,p.asset order by p.account`,[organizationId]);return result.rows}
}
export const acpLedger=new AcpLedgerService();
