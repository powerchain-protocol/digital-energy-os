-- PowerChain Control Plane / Energy Network / Copilot Credits v1.0.0

CREATE TABLE IF NOT EXISTS acp_provider_directory (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  participant_type TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  identity_hash TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  event_endpoint TEXT,
  credential_reference TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','offline')),
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  offerings JSONB NOT NULL DEFAULT '[]',
  chains INTEGER[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  successful_jobs INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(6,3),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS acp_provider_directory_search_idx ON acp_provider_directory(status,participant_type,name);
CREATE INDEX IF NOT EXISTS acp_provider_directory_capabilities_idx ON acp_provider_directory USING GIN(capabilities);

CREATE TABLE IF NOT EXISTS energy_network_participants (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  public_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  participant_type TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  energy_sources TEXT[] NOT NULL DEFAULT '{}',
  markets TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false,
  public_profile BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS energy_network_participants_public_idx ON energy_network_participants(public_profile,participant_type,country,region);
CREATE INDEX IF NOT EXISTS energy_network_participants_cap_idx ON energy_network_participants USING GIN(capabilities);

CREATE TABLE IF NOT EXISTS copilot_credit_accounts (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance_pwrc_raw NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(balance_pwrc_raw >= 0),
  reserved_pwrc_raw NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(reserved_pwrc_raw >= 0),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT copilot_credit_account_user_org_unique UNIQUE(organization_id,user_id),
  CONSTRAINT copilot_credit_account_reserved_lte_balance CHECK(reserved_pwrc_raw <= balance_pwrc_raw)
);

CREATE TABLE IF NOT EXISTS copilot_credit_ledger_entries (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES copilot_credit_accounts(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('deposit','purchase','reservation','settlement','release','admin_adjustment')),
  pwrc_raw NUMERIC(78,0) NOT NULL CHECK(pwrc_raw >= 0),
  direction TEXT NOT NULL CHECK(direction IN ('credit','debit','hold','release')),
  request_id TEXT,
  quote_id TEXT,
  reservation_id TEXT,
  external_reference TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS copilot_credit_ledger_external_unique ON copilot_credit_ledger_entries(organization_id,external_reference) WHERE external_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS copilot_credit_ledger_account_idx ON copilot_credit_ledger_entries(account_id,created_at DESC);

CREATE TABLE IF NOT EXISTS copilot_credit_reservations (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES copilot_credit_accounts(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  quote_id TEXT NOT NULL,
  pricing_class TEXT NOT NULL CHECK(pricing_class IN ('BASE','REAL_DATA')),
  usd_charge NUMERIC(12,6) NOT NULL,
  pwrc_usd_price NUMERIC(24,12) NOT NULL,
  reserved_pwrc_raw NUMERIC(78,0) NOT NULL CHECK(reserved_pwrc_raw > 0),
  settled_pwrc_raw NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(settled_pwrc_raw >= 0),
  state TEXT NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','settled','released')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  CONSTRAINT copilot_credit_reservation_request_unique UNIQUE(organization_id,request_id)
);
CREATE INDEX IF NOT EXISTS copilot_credit_reservation_expiry_idx ON copilot_credit_reservations(state,expires_at);

CREATE TABLE IF NOT EXISTS vault_records (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  classification TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  storage_reference TEXT NOT NULL,
  retention_policy TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT vault_record_hash_unique UNIQUE(organization_id,content_hash,storage_reference)
);

CREATE TABLE IF NOT EXISTS reward_allocations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  epoch TEXT NOT NULL,
  reason TEXT NOT NULL,
  pwrc_raw NUMERIC(78,0) NOT NULL CHECK(pwrc_raw > 0),
  evidence_ids TEXT[] NOT NULL DEFAULT '{}',
  state TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reward_allocation_unique UNIQUE(organization_id,participant_id,epoch,reason)
);

CREATE TABLE IF NOT EXISTS erp_documents (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  external_reference TEXT,
  counterparty_id TEXT,
  currency TEXT NOT NULL,
  amount_minor NUMERIC(78,0) NOT NULL,
  status TEXT NOT NULL,
  source_system TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS erp_documents_org_status_idx ON erp_documents(organization_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS cmr_relationships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  consents TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cmr_relationship_org_participant_unique UNIQUE(organization_id,participant_id,relationship_type)
);
CREATE TABLE IF NOT EXISTS cmr_interactions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  relationship_id TEXT NOT NULL REFERENCES cmr_relationships(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  summary TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Defense-in-depth tenant policies. Public directory records may be global (organization_id IS NULL).
ALTER TABLE acp_provider_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS powerchain_provider_directory_isolation ON acp_provider_directory;
CREATE POLICY powerchain_provider_directory_isolation ON acp_provider_directory
  USING (organization_id IS NULL OR organization_id = powerchain_current_organization_id())
  WITH CHECK (organization_id IS NULL OR organization_id = powerchain_current_organization_id());

ALTER TABLE energy_network_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS powerchain_energy_network_isolation ON energy_network_participants;
CREATE POLICY powerchain_energy_network_isolation ON energy_network_participants
  USING (public_profile = true OR organization_id = powerchain_current_organization_id())
  WITH CHECK (organization_id IS NULL OR organization_id = powerchain_current_organization_id());

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['copilot_credit_accounts','copilot_credit_ledger_entries','copilot_credit_reservations','vault_records','reward_allocations','erp_documents','cmr_relationships','cmr_interactions']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('DROP POLICY IF EXISTS powerchain_org_isolation ON %I',t);
    EXECUTE format('CREATE POLICY powerchain_org_isolation ON %I USING (organization_id::text = powerchain_current_organization_id()) WITH CHECK (organization_id::text = powerchain_current_organization_id())',t);
  END LOOP;
END $$;
