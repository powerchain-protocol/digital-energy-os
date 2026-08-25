CREATE TABLE IF NOT EXISTS treasury_accounts (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  asset TEXT NOT NULL,
  balance_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT treasury_accounts_org_code_asset_uq UNIQUE(organization_id,code,asset)
);
CREATE INDEX IF NOT EXISTS treasury_accounts_org_type_idx ON treasury_accounts(organization_id,account_type,status);

CREATE TABLE IF NOT EXISTS treasury_journals (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  business_reference TEXT NOT NULL,
  journal_type TEXT NOT NULL,
  source_journal_id TEXT,
  reason TEXT,
  request_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  policy_hash TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT treasury_journals_org_business_reference_uq UNIQUE(organization_id,business_reference)
);
CREATE INDEX IF NOT EXISTS treasury_journals_org_posted_idx ON treasury_journals(organization_id,posted_at DESC);

CREATE TABLE IF NOT EXISTS treasury_postings (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL,
  journal_id TEXT NOT NULL REFERENCES treasury_journals(id) ON DELETE RESTRICT,
  account_id TEXT NOT NULL REFERENCES treasury_accounts(id) ON DELETE RESTRICT,
  asset TEXT NOT NULL,
  amount_raw NUMERIC(78,0) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('DEBIT','CREDIT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS treasury_postings_org_journal_idx ON treasury_postings(organization_id,journal_id);
CREATE INDEX IF NOT EXISTS treasury_postings_org_account_idx ON treasury_postings(organization_id,account_id,created_at DESC);

ALTER TABLE treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS treasury_accounts_org_isolation ON treasury_accounts;
CREATE POLICY treasury_accounts_org_isolation ON treasury_accounts USING (organization_id::text = current_setting('app.current_organization_id', true));
DROP POLICY IF EXISTS treasury_journals_org_isolation ON treasury_journals;
CREATE POLICY treasury_journals_org_isolation ON treasury_journals USING (organization_id::text = current_setting('app.current_organization_id', true));
DROP POLICY IF EXISTS treasury_postings_org_isolation ON treasury_postings;
CREATE POLICY treasury_postings_org_isolation ON treasury_postings USING (organization_id::text = current_setting('app.current_organization_id', true));
