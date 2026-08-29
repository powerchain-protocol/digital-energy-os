-- PowerChain v1.0.0 — deterministic tokenized Copilot response proofs and PWRC chat credits.
ALTER TABLE ai_messages ALTER COLUMN content DROP NOT NULL;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS content_ciphertext TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS content_nonce TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS content_auth_tag TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS encryption_key_id TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS quote_hash TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS response_hash TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS token_proof_hash TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS reservation_id TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS message_unit_id TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS receipt_id TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS receipt_hash TEXT;
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS pwrc_debit_base_units NUMERIC(78,0);
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS reference_value_usd NUMERIC(12,6);
ALTER TABLE ai_messages ADD COLUMN IF NOT EXISTS settlement_status TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS ai_messages_token_proof_hash_unique ON ai_messages(token_proof_hash);
CREATE INDEX IF NOT EXISTS ai_messages_receipt_lookup_idx ON ai_messages(receipt_id);
CREATE INDEX IF NOT EXISTS ai_messages_reservation_lookup_idx ON ai_messages(reservation_id);

CREATE TABLE IF NOT EXISTS chat_credit_accounts(
 id TEXT PRIMARY KEY,user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
 available_base_units NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(available_base_units>=0),
 reserved_base_units NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(reserved_base_units>=0),
 spent_base_units NUMERIC(78,0) NOT NULL DEFAULT 0 CHECK(spent_base_units>=0),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT chat_credit_account_reserved_lte_available CHECK(reserved_base_units<=available_base_units)
);
CREATE TABLE IF NOT EXISTS chat_credit_quotes(
 id TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
 request_id TEXT NOT NULL UNIQUE,quote_hash TEXT NOT NULL UNIQUE,canonical_payload JSONB NOT NULL,message_units INTEGER NOT NULL DEFAULT 1 CHECK(message_units=1),
 pwrc_base_units NUMERIC(78,0) NOT NULL CHECK(pwrc_base_units=10000000000000),reference_value_usd NUMERIC(12,6) NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_credit_quotes_user_chat_idx ON chat_credit_quotes(user_id,chat_id,created_at DESC);
CREATE TABLE IF NOT EXISTS chat_credit_reservations(
 id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES chat_credit_accounts(id) ON DELETE RESTRICT,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,quote_id TEXT NOT NULL REFERENCES chat_credit_quotes(id) ON DELETE RESTRICT,quote_hash TEXT NOT NULL,
 request_id TEXT NOT NULL UNIQUE,reserved_base_units NUMERIC(78,0) NOT NULL CHECK(reserved_base_units=10000000000000),
 state TEXT NOT NULL DEFAULT 'RESERVED' CHECK(state IN('RESERVED','SETTLED','RELEASED')),expires_at TIMESTAMPTZ NOT NULL,settled_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_credit_reservations_user_chat_idx ON chat_credit_reservations(user_id,chat_id,state,created_at DESC);
CREATE INDEX IF NOT EXISTS chat_credit_reservations_quote_idx ON chat_credit_reservations(quote_hash);
CREATE TABLE IF NOT EXISTS chat_message_units(
 id TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
 message_id UUID NOT NULL UNIQUE REFERENCES ai_messages(id) ON DELETE CASCADE,reservation_id TEXT NOT NULL UNIQUE REFERENCES chat_credit_reservations(id) ON DELETE RESTRICT,
 units INTEGER NOT NULL DEFAULT 1 CHECK(units=1),pwrc_debit_base_units NUMERIC(78,0) NOT NULL CHECK(pwrc_debit_base_units=10000000000000),reference_value_usd NUMERIC(12,6) NOT NULL,
 state TEXT NOT NULL DEFAULT 'SETTLED' CHECK(state='SETTLED'),created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_message_units_user_chat_idx ON chat_message_units(user_id,chat_id,created_at DESC);
CREATE TABLE IF NOT EXISTS chat_receipts(
 id TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
 message_id UUID NOT NULL UNIQUE REFERENCES ai_messages(id) ON DELETE CASCADE,reservation_id TEXT NOT NULL REFERENCES chat_credit_reservations(id) ON DELETE RESTRICT,
 quote_hash TEXT NOT NULL,response_hash TEXT NOT NULL,receipt_hash TEXT NOT NULL UNIQUE,signature TEXT NOT NULL,signing_key_id TEXT NOT NULL,
 pwrc_debit_base_units NUMERIC(78,0) NOT NULL CHECK(pwrc_debit_base_units=10000000000000),reference_value_usd NUMERIC(12,6) NOT NULL,issued_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_receipts_reservation_idx ON chat_receipts(reservation_id);
CREATE INDEX IF NOT EXISTS chat_receipts_hash_lookup_idx ON chat_receipts(receipt_hash);
CREATE TABLE IF NOT EXISTS chat_token_proofs(
 id TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,chat_id UUID NOT NULL REFERENCES ai_chats(id) ON DELETE CASCADE,
 message_id UUID NOT NULL UNIQUE REFERENCES ai_messages(id) ON DELETE CASCADE,quote_hash TEXT NOT NULL,reservation_id TEXT NOT NULL,response_id UUID NOT NULL,
 response_hash TEXT NOT NULL,receipt_id TEXT NOT NULL REFERENCES chat_receipts(id) ON DELETE RESTRICT,receipt_hash TEXT NOT NULL,message_unit_id TEXT NOT NULL REFERENCES chat_message_units(id) ON DELETE RESTRICT,
 token_proof_hash TEXT NOT NULL UNIQUE,settlement_status TEXT NOT NULL DEFAULT 'SETTLED' CHECK(settlement_status='SETTLED'),transferable BOOLEAN NOT NULL DEFAULT false CHECK(transferable=false),
 minted_asset BOOLEAN NOT NULL DEFAULT false CHECK(minted_asset=false),financial_instrument BOOLEAN NOT NULL DEFAULT false CHECK(financial_instrument=false),created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_token_proofs_user_chat_idx ON chat_token_proofs(user_id,chat_id,created_at DESC);
CREATE INDEX IF NOT EXISTS chat_token_proofs_receipt_idx ON chat_token_proofs(receipt_id);
CREATE TABLE IF NOT EXISTS chat_credit_ledger_entries(
 id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES chat_credit_accounts(id) ON DELETE RESTRICT,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 chat_id UUID REFERENCES ai_chats(id) ON DELETE SET NULL,message_id UUID REFERENCES ai_messages(id) ON DELETE SET NULL,reservation_id TEXT,receipt_id TEXT,
 entry_type TEXT NOT NULL CHECK(entry_type IN('FUND','RESERVE','RELEASE','SPEND')),base_units NUMERIC(78,0) NOT NULL CHECK(base_units>0),external_reference TEXT UNIQUE,metadata JSONB NOT NULL DEFAULT '{}',created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_credit_ledger_user_chat_idx ON chat_credit_ledger_entries(user_id,chat_id,created_at DESC);
CREATE INDEX IF NOT EXISTS chat_credit_ledger_receipt_idx ON chat_credit_ledger_entries(receipt_id);
