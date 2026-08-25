import type { AcpAllowedAction,AcpJob,AcpJobState,Money } from "@powerchain/acp-contracts";
import { AcpInvariantError } from "../invariants/index";

const transitions:Record<AcpJobState,ReadonlySet<AcpJobState>>={
  draft:new Set(["pending_proposal_approval"]),pending_proposal_approval:new Set(["proposal_approved","rejected"]),proposal_approved:new Set(["creating"]),
  creating:new Set(["created","execution_unknown","reconciling","reconciliation_conflict"]),created:new Set(["pending_funding_approval","in_progress","rejected"]),pending_funding_approval:new Set(["funding_authorized","created","rejected"]),
  funding_authorized:new Set(["funding"]),funding:new Set(["funded","execution_unknown","reconciling","reconciliation_conflict"]),execution_unknown:new Set(["reconciling"]),funded:new Set(["in_progress","submitted","reconciling"]),
  in_progress:new Set(["submitted","revision_requested","rejected","reconciling"]),submitted:new Set(["pending_completion_approval","revision_requested","disputed","rejected","reconciling"]),
  pending_completion_approval:new Set(["completion_authorized","submitted","revision_requested","rejected"]),completion_authorized:new Set(["completing"]),completing:new Set(["completed","execution_unknown","reconciling","reconciliation_conflict"]),
  completed:new Set(["reconciling"]),revision_requested:new Set(["in_progress","submitted","rejected"]),rejected:new Set(["reconciling"]),disputed:new Set(["in_progress","rejected","completed"]),
  reconciling:new Set(["funded","in_progress","submitted","completed","rejected","reconciliation_conflict","execution_unknown"]),reconciliation_conflict:new Set(["reconciling"]),expired:new Set(["reconciling"]),
};
export function assertTransitionAllowed(from:AcpJobState,to:AcpJobState){if(!transitions[from]?.has(to))throw new AcpInvariantError("ACP-I007",`Transition ${from} -> ${to} is not permitted`)}
export function transitionJob(job:AcpJob,to:AcpJobState):AcpJob{assertTransitionAllowed(job.state,to);const now=new Date().toISOString();return{...job,state:to,version:job.version+1,updatedAt:now}}
export function deriveAllowedActions(job:AcpJob):AcpAllowedAction[]{
  const route=(action:string)=>`/api/v1/acp/jobs/${encodeURIComponent(job.id)}/${action}`;
  const funding=(id:AcpAllowedAction["id"],label:string,requiresApproval:boolean,financial?:Money):AcpAllowedAction=>({id,label,method:"POST",endpoint:route(id.replaceAll("_","-")),consequential:true,requiresApproval,...(financial?{financial}:{})});
  switch(job.state){
    case"created":return[funding("request_funding","Request funding",true,job.approvedBudget)];
    case"pending_funding_approval":return[funding("approve_funding",`Approve ${job.approvedBudget.displayAmount??job.approvedBudget.rawAmount} USDC`,true,job.approvedBudget)];
    case"submitted":return[{id:"review_deliverable",label:"Review deliverable",method:"POST",endpoint:route("review-deliverable"),consequential:false,requiresApproval:false},{id:"request_completion",label:"Request completion approval",method:"POST",endpoint:route("request-completion"),consequential:true,requiresApproval:true},{id:"request_revision",label:"Request revision",method:"POST",endpoint:route("request-revision"),consequential:true,requiresApproval:false}];
    case"execution_unknown":case"reconciliation_conflict":return[{id:"reconcile",label:"Run reconciliation",method:"POST",endpoint:route("reconcile"),consequential:true,requiresApproval:false}];
    default:return[];
  }
}
