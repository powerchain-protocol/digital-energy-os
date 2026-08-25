-- PowerChain Local Energy v1.0.0 — canonical integer Wh marketplace including RENT.
CREATE TABLE IF NOT EXISTS local_energy_listings (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('BUY','SELL','RENT')),
  source TEXT NOT NULL,
  asset_id TEXT,
  quantity_wh BIGINT NOT NULL CHECK(quantity_wh > 0),
  available_wh BIGINT NOT NULL CHECK(available_wh >= 0 AND available_wh <= quantity_wh),
  price_minor_per_kwh BIGINT NOT NULL CHECK(price_minor_per_kwh >= 0),
  currency TEXT NOT NULL,
  delivery_start TIMESTAMPTZ NOT NULL,
  delivery_end TIMESTAMPTZ NOT NULL,
  state TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(state IN ('ACTIVE','PAUSED','CLOSED')),
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT local_energy_listing_window CHECK(delivery_end > delivery_start)
);
CREATE INDEX IF NOT EXISTS local_energy_listing_market_idx ON local_energy_listings(mode,state,delivery_start);
CREATE INDEX IF NOT EXISTS local_energy_listing_org_idx ON local_energy_listings(organization_id,updated_at DESC);

CREATE TABLE IF NOT EXISTS local_energy_reservations (
  id TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES local_energy_listings(id) ON DELETE RESTRICT,
  counterparty_participant_id TEXT NOT NULL,
  quantity_wh BIGINT NOT NULL CHECK(quantity_wh > 0),
  listing_version INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED' CHECK(state IN ('REVIEW_REQUIRED','RESERVED','DELIVERING','DELIVERED','RECONCILED','SETTLEMENT_READY','SETTLED','DISPUTED','CANCELLED')),
  idempotency_key TEXT NOT NULL,
  delivery_evidence_id TEXT,
  reconciliation_reference TEXT,
  external_settlement_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT local_energy_reservation_idempotency UNIQUE(organization_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS local_energy_reservation_listing_idx ON local_energy_reservations(listing_id,state,created_at DESC);
CREATE INDEX IF NOT EXISTS local_energy_reservation_org_idx ON local_energy_reservations(organization_id,state,updated_at DESC);

ALTER TABLE local_energy_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS powerchain_local_energy_listing_org ON local_energy_listings;
CREATE POLICY powerchain_local_energy_listing_org ON local_energy_listings
  USING (organization_id::text = powerchain_current_organization_id())
  WITH CHECK (organization_id::text = powerchain_current_organization_id());
ALTER TABLE local_energy_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS powerchain_local_energy_reservation_org ON local_energy_reservations;
CREATE POLICY powerchain_local_energy_reservation_org ON local_energy_reservations
  USING (organization_id::text = powerchain_current_organization_id())
  WITH CHECK (organization_id::text = powerchain_current_organization_id());
