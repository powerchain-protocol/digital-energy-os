import type { AcpCommand,AcpCommandType,CausalContext } from "@powerchain/acp-contracts";
import { acpKernel } from "../kernel/index";
export const guardedAcpTools=["acp_search_providers","acp_compare_providers","acp_prepare_proposal","acp_get_job","acp_request_job_creation","acp_request_funding","acp_evaluate_deliverable","acp_request_completion"] as const;
export type GuardedAcpTool=typeof guardedAcpTools[number];
export const forbiddenAcpTools=["acp_fund_now","acp_raw_session","acp_execute_tool","wallet_sign","force_complete"] as const;
export async function dispatchCopilotAcpCommand(input:CausalContext&{organizationId:string;agentId:string;messageId:string;type:AcpCommandType;payload:Record<string,unknown>;idempotencyKey:string}){const command:AcpCommand={id:`cmd_${crypto.randomUUID().replaceAll("-","")}`,type:input.type,organizationId:input.organizationId,actor:{type:"agent",id:input.agentId},payload:input.payload,idempotencyKey:input.idempotencyKey,requestId:input.requestId,traceId:input.traceId,correlationId:input.correlationId,causationId:input.messageId,createdAt:new Date().toISOString()};return acpKernel.dispatch(command)}
