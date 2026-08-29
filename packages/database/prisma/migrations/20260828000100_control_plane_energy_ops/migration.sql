CREATE TABLE IF NOT EXISTS energy_network_participants (
  id TEXT PRIMARY KEY, organization_id TEXT, public_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  participant_type TEXT NOT NULL, country TEXT NOT NULL, region TEXT, latitude NUMERIC(9,6), longitude NUMERIC(9,6),
  capabilities TEXT[] NOT NULL DEFAULT '{}', energy_sources TEXT[] NOT NULL DEFAULT '{}', markets TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false, public_profile BOOLEAN NOT NULL DEFAULT false, metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS energy_network_participants_search_idx ON energy_network_participants(public_profile,participant_type,country,region);
CREATE INDEX IF NOT EXISTS energy_network_participants_cap_idx ON energy_network_participants USING GIN(capabilities);

CREATE TABLE IF NOT EXISTS local_energy_listings (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, participant_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('BUY','SELL','RENT')), source TEXT NOT NULL, asset_id TEXT,
  quantity_wh BIGINT NOT NULL CHECK(quantity_wh>0), available_wh BIGINT NOT NULL CHECK(available_wh>=0 AND available_wh<=quantity_wh),
  price_minor_per_kwh BIGINT NOT NULL CHECK(price_minor_per_kwh>=0), currency TEXT NOT NULL,
  delivery_start TIMESTAMPTZ NOT NULL, delivery_end TIMESTAMPTZ NOT NULL,
  state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(state IN ('ACTIVE','PAUSED','CLOSED')), version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
  metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT local_energy_listing_window CHECK(delivery_end>delivery_start)
);
CREATE INDEX IF NOT EXISTS local_energy_listing_market_idx ON local_energy_listings(mode,state,delivery_start);
CREATE INDEX IF NOT EXISTS local_energy_listing_org_idx ON local_energy_listings(organization_id,updated_at DESC);

CREATE TABLE IF NOT EXISTS local_energy_reservations (
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, listing_id TEXT NOT NULL REFERENCES local_energy_listings(id) ON DELETE RESTRICT,
  counterparty_participant_id TEXT NOT NULL, quantity_wh BIGINT NOT NULL CHECK(quantity_wh>0), listing_version INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED' CHECK(state IN ('REVIEW_REQUIRED','RESERVED','DELIVERING','DELIVERED','RECONCILED','SETTLEMENT_READY','SETTLED','DISPUTED','CANCELLED')),
  idempotency_key TEXT NOT NULL, delivery_evidence_id TEXT, reconciliation_reference TEXT, external_settlement_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT local_energy_reservation_idempotency UNIQUE(organization_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS local_energy_reservation_listing_idx ON local_energy_reservations(listing_id,state,created_at DESC);

CREATE TABLE IF NOT EXISTS erp_documents (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, document_type TEXT NOT NULL, external_reference TEXT, counterparty_id TEXT,
 currency TEXT NOT NULL, amount_minor NUMERIC(78,0) NOT NULL, status TEXT NOT NULL, source_system TEXT NOT NULL,
 metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS erp_documents_org_idx ON erp_documents(organization_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS cmr_relationships (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, participant_id TEXT NOT NULL, relationship_type TEXT NOT NULL, status TEXT NOT NULL,
 owner_id TEXT, tags TEXT[] NOT NULL DEFAULT '{}', consents TEXT[] NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT cmr_relationship_org_unique UNIQUE(organization_id,participant_id,relationship_type)
);

CREATE TABLE IF NOT EXISTS reward_allocations (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, participant_id TEXT NOT NULL, epoch TEXT NOT NULL, reason TEXT NOT NULL,
 pwrc_raw NUMERIC(78,0) NOT NULL CHECK(pwrc_raw>0), evidence_ids TEXT[] NOT NULL DEFAULT '{}', state TEXT NOT NULL DEFAULT 'PENDING',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT reward_allocation_unique UNIQUE(organization_id,participant_id,epoch,reason)
);

CREATE TABLE IF NOT EXISTS treasury_accounts (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, account_type TEXT NOT NULL, asset TEXT NOT NULL,
 balance_raw NUMERIC(78,0) NOT NULL DEFAULT 0, reserved_raw NUMERIC(78,0) NOT NULL DEFAULT 0,
 version INTEGER NOT NULL DEFAULT 1, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT treasury_account_unique UNIQUE(organization_id,account_type,asset)
);
CREATE TABLE IF NOT EXISTS treasury_allocations (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, source_account_id TEXT NOT NULL REFERENCES treasury_accounts(id), destination_account_id TEXT NOT NULL REFERENCES treasury_accounts(id),
 asset TEXT NOT NULL, amount_raw NUMERIC(78,0) NOT NULL CHECK(amount_raw>0), reason TEXT NOT NULL, policy_hash TEXT NOT NULL,
 expected_source_version INTEGER NOT NULL, idempotency_key TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), posted_at TIMESTAMPTZ,
 CONSTRAINT treasury_allocation_idempotency UNIQUE(organization_id,idempotency_key)
);

CREATE TABLE IF NOT EXISTS vault_records (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, classification TEXT NOT NULL, content_hash TEXT NOT NULL,
 storage_reference TEXT NOT NULL, retention_policy TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT vault_record_unique UNIQUE(organization_id,content_hash,storage_reference)
);

CREATE TABLE IF NOT EXISTS asset_graph_nodes (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, node_type TEXT NOT NULL, label TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS asset_graph_relationships (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, from_id TEXT NOT NULL, to_id TEXT NOT NULL, relationship_type TEXT NOT NULL,
 evidence_ids TEXT[] NOT NULL DEFAULT '{}', valid_from TIMESTAMPTZ NOT NULL, valid_to TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS asset_graph_relationship_idx ON asset_graph_relationships(organization_id,from_id,to_id,relationship_type);

CREATE TABLE IF NOT EXISTS device_command_intents (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, device_id TEXT NOT NULL, command_type TEXT NOT NULL, requested_by TEXT NOT NULL,
 expected_device_version INTEGER NOT NULL, reason TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
 request_id TEXT NOT NULL, trace_id TEXT NOT NULL, correlation_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS renewable_revenue_events (
 id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, asset_id TEXT, source TEXT NOT NULL, energy_wh BIGINT NOT NULL CHECK(energy_wh>=0),
 currency TEXT NOT NULL, gross_minor NUMERIC(78,0) NOT NULL CHECK(gross_minor>=0), evidence_ids TEXT[] NOT NULL DEFAULT '{}',
 state TEXT NOT NULL DEFAULT 'CALCULATED', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
