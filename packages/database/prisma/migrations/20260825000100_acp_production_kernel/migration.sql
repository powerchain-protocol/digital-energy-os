-- PowerChain ACP v1.0.0 production kernel.
-- Durable tenant-scoped commands, approvals, attempts, inbox/outbox, evidence, accounting and realtime event history.

CREATE TABLE IF NOT EXISTS acp_commands (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  expected_resource_version INTEGER,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  receipt JSONB,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_commands_org_idempotency UNIQUE (organization_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS acp_commands_org_created_idx ON acp_commands(organization_id,created_at DESC);

CREATE TABLE IF NOT EXISTS acp_jobs (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL,
  proposal_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_identity_hash TEXT NOT NULL,
  external_job_id TEXT,
  chain_id INTEGER NOT NULL,
  capability_id TEXT NOT NULL,
  offering_name TEXT NOT NULL,
  requirements JSONB NOT NULL,
  requirements_hash TEXT NOT NULL,
  requirements_version INTEGER NOT NULL DEFAULT 1,
  requirements_locked BOOLEAN NOT NULL DEFAULT FALSE,
  state TEXT NOT NULL,
  approved_budget_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  reserved_budget_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  actual_spend_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  last_external_event_at TIMESTAMPTZ,
  last_reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_jobs_org_external UNIQUE (organization_id,chain_id,external_job_id)
);
CREATE INDEX IF NOT EXISTS acp_jobs_org_state_idx ON acp_jobs(organization_id,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS acp_jobs_org_provider_idx ON acp_jobs(organization_id,provider_id,updated_at DESC);


CREATE TABLE IF NOT EXISTS acp_proposals (
  id TEXT PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  provider_identity_hash TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  offering_name TEXT NOT NULL,
  requirements JSONB NOT NULL,
  requirements_hash TEXT NOT NULL,
  maximum_budget_raw NUMERIC(78,0) NOT NULL,
  strategy TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_proposals_org_status_idx ON acp_proposals(organization_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS acp_budget_reservations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES acp_jobs(id) ON DELETE CASCADE,
  authorization_id TEXT NOT NULL,
  amount_raw NUMERIC(78,0) NOT NULL,
  asset TEXT NOT NULL DEFAULT 'USDC',
  state TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  CONSTRAINT acp_budget_reservation_authorization_unique UNIQUE(organization_id,authorization_id)
);
CREATE INDEX IF NOT EXISTS acp_budget_reservations_org_state_idx ON acp_budget_reservations(organization_id,state,expires_at);

CREATE TABLE IF NOT EXISTS acp_approvals (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  job_id TEXT REFERENCES acp_jobs(id) ON DELETE CASCADE,
  resource_version INTEGER NOT NULL,
  proposal_hash TEXT NOT NULL,
  provider_identity TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  amount_raw NUMERIC(78,0) NOT NULL,
  asset TEXT NOT NULL,
  requirements_hash TEXT NOT NULL,
  policy_snapshot_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  decision TEXT NOT NULL DEFAULT 'pending',
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_approvals_org_decision_idx ON acp_approvals(organization_id,decision,expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS acp_approvals_single_active_idx ON acp_approvals(organization_id,resource_type,resource_id,action) WHERE decision='pending';

CREATE TABLE IF NOT EXISTS acp_policy_snapshots (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT,
  action TEXT NOT NULL,
  version INTEGER NOT NULL,
  policy_hash TEXT NOT NULL,
  policy JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_policy_snapshot_hash_unique UNIQUE(organization_id,policy_hash)
);
CREATE INDEX IF NOT EXISTS acp_policy_snapshots_org_created_idx ON acp_policy_snapshots(organization_id,created_at DESC);

CREATE TABLE IF NOT EXISTS acp_execution_authorizations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES acp_jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  approval_id TEXT NOT NULL REFERENCES acp_approvals(id),
  provider_identity_hash TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  amount_raw NUMERIC(78,0),
  requirements_hash TEXT NOT NULL,
  policy_snapshot_hash TEXT NOT NULL,
  resource_version INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_execution_authorization_approval_unique UNIQUE(approval_id)
);
CREATE INDEX IF NOT EXISTS acp_execution_authorizations_org_job_idx ON acp_execution_authorizations(organization_id,job_id,created_at DESC);

CREATE TABLE IF NOT EXISTS acp_execution_attempts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES acp_jobs(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  authorization_id TEXT NOT NULL REFERENCES acp_execution_authorizations(id),
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  external_reference TEXT,
  error_code TEXT,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_execution_attempt_org_idempotency UNIQUE(organization_id,idempotency_key),
  CONSTRAINT acp_execution_attempt_number_unique UNIQUE(organization_id,job_id,operation,attempt_number)
);
CREATE INDEX IF NOT EXISTS acp_execution_attempts_org_status_idx ON acp_execution_attempts(organization_id,status,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS acp_execution_attempt_active_financial_idx ON acp_execution_attempts(organization_id,job_id,operation)
  WHERE status IN ('created','executing','succeeded','unknown');

CREATE TABLE IF NOT EXISTS acp_execution_receipts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES acp_jobs(id) ON DELETE CASCADE,
  attempt_id TEXT NOT NULL UNIQUE REFERENCES acp_execution_attempts(id),
  operation TEXT NOT NULL,
  external_job_id TEXT NOT NULL,
  transaction_reference TEXT,
  status TEXT NOT NULL,
  principal_raw NUMERIC(78,0),
  network_fee_raw NUMERIC(78,0),
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_execution_receipts_org_job_idx ON acp_execution_receipts(organization_id,job_id,received_at DESC);

CREATE TABLE IF NOT EXISTS acp_event_inbox (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  source TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  external_job_id TEXT NOT NULL,
  event_fingerprint TEXT NOT NULL,
  external_event_type TEXT,
  mapped_event_type TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  CONSTRAINT acp_event_inbox_fingerprint_unique UNIQUE(source,chain_id,external_job_id,event_fingerprint)
);
CREATE INDEX IF NOT EXISTS acp_event_inbox_pending_idx ON acp_event_inbox(processed_at,received_at) WHERE processed_at IS NULL;


CREATE TABLE IF NOT EXISTS acp_event_orphans (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  external_job_id TEXT NOT NULL,
  event_fingerprint TEXT NOT NULL,
  external_event_type TEXT,
  mapped_event_type TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_organization_id TEXT,
  resolved_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  CONSTRAINT acp_event_orphan_fingerprint_unique UNIQUE(source,chain_id,external_job_id,event_fingerprint)
);
CREATE INDEX IF NOT EXISTS acp_event_orphans_unresolved_idx ON acp_event_orphans(resolved_at,received_at) WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS acp_outbox (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS acp_outbox_publish_idx ON acp_outbox(state,next_attempt_at,created_at);

CREATE TABLE IF NOT EXISTS acp_provider_cache (
  organization_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  provider JSONB NOT NULL,
  source TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(organization_id,provider_id,capability_id)
);
CREATE INDEX IF NOT EXISTS acp_provider_cache_lookup_idx ON acp_provider_cache(organization_id,capability_id,expires_at DESC);

CREATE TABLE IF NOT EXISTS acp_evidence (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL REFERENCES acp_jobs(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source TEXT NOT NULL,
  source_timestamp TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validation_state TEXT NOT NULL,
  classification TEXT NOT NULL,
  truth_tier TEXT NOT NULL,
  retention_policy TEXT NOT NULL,
  asset_id TEXT,
  project_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT acp_evidence_hash_unique UNIQUE(organization_id,job_id,content_hash)
);
CREATE INDEX IF NOT EXISTS acp_evidence_org_job_idx ON acp_evidence(organization_id,job_id,received_at DESC);

CREATE TABLE IF NOT EXISTS acp_incidents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT,
  severity TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS acp_incidents_org_status_idx ON acp_incidents(organization_id,status,severity,created_at DESC);

CREATE TABLE IF NOT EXISTS acp_accounting_periods (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  period TEXT NOT NULL,
  status TEXT NOT NULL,
  reconciled_jobs INTEGER NOT NULL DEFAULT 0,
  wallet_variance_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  ledger_variance_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  unknown_executions INTEGER NOT NULL DEFAULT 0,
  open_critical_incidents INTEGER NOT NULL DEFAULT 0,
  close_hash TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  CONSTRAINT acp_accounting_period_org_unique UNIQUE(organization_id,period)
);

CREATE TABLE IF NOT EXISTS acp_execution_accounts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  address TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'ACP_COMMERCE_ONLY',
  asset TEXT NOT NULL DEFAULT 'USDC',
  state TEXT NOT NULL DEFAULT 'ACTIVE',
  daily_limit_raw NUMERIC(78,0) NOT NULL,
  spent_today_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  wallet_provider TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_execution_accounts_org_chain_unique UNIQUE(organization_id,chain_id)
);

CREATE TABLE IF NOT EXISTS acp_ledger_journals (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  business_reference TEXT NOT NULL,
  execution_attempt_id TEXT NOT NULL,
  execution_receipt_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acp_ledger_business_reference_unique UNIQUE(organization_id,business_reference)
);
CREATE TABLE IF NOT EXISTS acp_ledger_postings (
  id TEXT PRIMARY KEY,
  journal_id TEXT NOT NULL REFERENCES acp_ledger_journals(id) ON DELETE CASCADE,
  account TEXT NOT NULL,
  asset TEXT NOT NULL,
  raw_amount NUMERIC(78,0) NOT NULL CHECK(raw_amount >= 0),
  side TEXT NOT NULL CHECK(side IN ('debit','credit')),
  memo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_ledger_postings_journal_idx ON acp_ledger_postings(journal_id);

CREATE TABLE IF NOT EXISTS acp_audit_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_audit_org_created_idx ON acp_audit_events(organization_id,created_at DESC);

CREATE TABLE IF NOT EXISTS realtime_events (
  sequence BIGSERIAL PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,
  organization_id TEXT,
  channel TEXT NOT NULL,
  event TEXT NOT NULL,
  data JSONB NOT NULL,
  request_id TEXT,
  trace_id TEXT,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours'
);
CREATE INDEX IF NOT EXISTS realtime_events_replay_idx ON realtime_events(organization_id,channel,sequence);
CREATE INDEX IF NOT EXISTS realtime_events_expiry_idx ON realtime_events(expires_at);

-- Tenant isolation: app code sets `app.current_organization_id` at transaction start.
CREATE OR REPLACE FUNCTION powerchain_current_organization_id() RETURNS TEXT
LANGUAGE SQL STABLE AS $$ SELECT NULLIF(current_setting('app.current_organization_id', true),'') $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['acp_commands','acp_proposals','acp_jobs','acp_budget_reservations','acp_approvals','acp_policy_snapshots','acp_execution_authorizations','acp_execution_attempts','acp_execution_receipts','acp_event_inbox','acp_outbox','acp_provider_cache','acp_evidence','acp_incidents','acp_accounting_periods','acp_execution_accounts','acp_ledger_journals','acp_audit_events']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('DROP POLICY IF EXISTS powerchain_org_isolation ON %I',t);
    EXECUTE format('CREATE POLICY powerchain_org_isolation ON %I USING (organization_id = powerchain_current_organization_id()) WITH CHECK (organization_id = powerchain_current_organization_id())',t);
  END LOOP;
END $$;
