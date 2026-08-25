import { createHash } from "node:crypto";
export const EVENT_MAP:Record<string,string>={
  "job.created":"powerchain.acp.external.job_created.v1",
  "budget.set":"powerchain.acp.external.budget_observed.v1",
  "job.funded":"powerchain.acp.external.funding_observed.v1",
  "job.submitted":"powerchain.acp.external.submission_observed.v1",
  "job.completed":"powerchain.acp.external.completion_observed.v1",
  "job.rejected":"powerchain.acp.external.rejection_observed.v1",
  "job.expired":"powerchain.acp.external.expiration_observed.v1",
};
export function mapProviderEventType(type:string|undefined){return EVENT_MAP[type??""]??"powerchain.acp.external.message_observed.v1"}
export function providerEventFingerprint(value:unknown){return createHash("sha256").update(JSON.stringify(value)).digest("hex")}
