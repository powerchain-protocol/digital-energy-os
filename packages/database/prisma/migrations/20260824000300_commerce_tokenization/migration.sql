CREATE TYPE "MarketplaceListingStatus" AS ENUM ('DRAFT','ACTIVE','PAUSED','SOLD_OUT','CLOSED');
CREATE TYPE "MarketplaceOrderStatus" AS ENUM ('RESERVED','CHECKOUT_PENDING','PAID','CANCELLED','EXPIRED');
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('CREATED','REVIEW','PENDING_SIGNATURE','SUBMITTED','CONFIRMED','CANCELLED','EXPIRED');
CREATE TYPE "CheckoutCurrency" AS ENUM ('EURC','PWRC','SOL','USDC');
CREATE TYPE "TokenizationNetwork" AS ENUM ('SOLANA','SUI');
CREATE TYPE "TokenizationIntentState" AS ENUM ('DRAFT','REVIEW_REQUIRED','APPROVED','AWAITING_WALLET','SUBMITTED','CONFIRMED','CANCELLED','FAILED');

CREATE TABLE "marketplace_listings"(
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "seller_id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "source" TEXT,
  "location" TEXT,
  "currency" "CheckoutCurrency" NOT NULL,
  "unit_amount_minor" BIGINT NOT NULL,
  "inventory" INTEGER NOT NULL,
  "remaining" INTEGER NOT NULL,
  "status" "MarketplaceListingStatus" NOT NULL DEFAULT 'DRAFT',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "marketplace_listing_inventory_positive" CHECK ("inventory" > 0),
  CONSTRAINT "marketplace_listing_remaining_valid" CHECK ("remaining" >= 0 AND "remaining" <= "inventory"),
  CONSTRAINT "marketplace_listing_amount_positive" CHECK ("unit_amount_minor" > 0),
  CONSTRAINT "marketplace_listing_org_slug_unique" UNIQUE ("organization_id","slug")
);
CREATE INDEX "marketplace_listing_org_status_idx" ON "marketplace_listings"("organization_id","status","updated_at" DESC);
CREATE INDEX "marketplace_listing_category_status_idx" ON "marketplace_listings"("category","status");

CREATE TABLE "marketplace_orders"(
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "listing_id" TEXT NOT NULL,
  "buyer_id" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "currency" "CheckoutCurrency" NOT NULL,
  "status" "MarketplaceOrderStatus" NOT NULL DEFAULT 'RESERVED',
  "checkout_session_id" TEXT,
  "idempotency_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "marketplace_orders_listing_fk" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "marketplace_order_quantity_positive" CHECK ("quantity" > 0),
  CONSTRAINT "marketplace_order_amount_positive" CHECK ("amount_minor" > 0),
  CONSTRAINT "marketplace_order_idempotency_unique" UNIQUE ("organization_id","idempotency_key")
);
CREATE INDEX "marketplace_orders_org_status_idx" ON "marketplace_orders"("organization_id","status","updated_at" DESC);
CREATE INDEX "marketplace_orders_listing_status_idx" ON "marketplace_orders"("listing_id","status");

CREATE TABLE "checkout_sessions"(
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "currency" "CheckoutCurrency" NOT NULL,
  "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'CREATED',
  "lines" JSONB NOT NULL,
  "subtotal_minor" BIGINT NOT NULL,
  "service_fee_minor" BIGINT NOT NULL,
  "network_fee_minor" BIGINT,
  "total_minor" BIGINT NOT NULL,
  "payer_wallet" TEXT,
  "return_url" TEXT,
  "settlement_signature" TEXT,
  "idempotency_key" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "checkout_session_amounts_nonnegative" CHECK ("subtotal_minor" >= 0 AND "service_fee_minor" >= 0 AND ("network_fee_minor" IS NULL OR "network_fee_minor" >= 0) AND "total_minor" >= 0),
  CONSTRAINT "checkout_session_idempotency_unique" UNIQUE ("organization_id","idempotency_key")
);
CREATE INDEX "checkout_sessions_org_status_idx" ON "checkout_sessions"("organization_id","status","updated_at" DESC);

CREATE TABLE "tokenization_intents"(
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "energy_position_id" TEXT NOT NULL,
  "network" "TokenizationNetwork" NOT NULL,
  "amount_wh" BIGINT NOT NULL,
  "state" "TokenizationIntentState" NOT NULL DEFAULT 'DRAFT',
  "asset_class" TEXT NOT NULL DEFAULT 'VERIFIED_ENERGY_POSITION',
  "metadata_standard" TEXT NOT NULL DEFAULT 'PET-20',
  "review_hash" TEXT NOT NULL,
  "wallet_reference" TEXT,
  "chain_reference" TEXT,
  "idempotency_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tokenization_intent_amount_positive" CHECK ("amount_wh" > 0),
  CONSTRAINT "tokenization_intent_idempotency_unique" UNIQUE ("organization_id","idempotency_key")
);
CREATE INDEX "tokenization_intents_org_state_idx" ON "tokenization_intents"("organization_id","state","updated_at" DESC);
CREATE INDEX "tokenization_intents_position_network_state_idx" ON "tokenization_intents"("energy_position_id","network","state");
