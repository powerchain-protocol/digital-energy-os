CREATE TABLE IF NOT EXISTS "connected_devices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "asset_id" UUID REFERENCES "energy_assets"("id") ON DELETE SET NULL,
  "device_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "firmware" TEXT,
  "serial_number" TEXT,
  "status" TEXT NOT NULL DEFAULT 'UNCONFIGURED',
  "network" TEXT NOT NULL,
  "health_score" INTEGER NOT NULL DEFAULT 0 CHECK ("health_score" BETWEEN 0 AND 100),
  "current_output_w" BIGINT,
  "cumulative_energy_wh" BIGINT,
  "last_seen_at" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("organization_id","device_id")
);
CREATE INDEX IF NOT EXISTS "connected_devices_org_status_idx" ON "connected_devices"("organization_id","status");
CREATE INDEX IF NOT EXISTS "connected_devices_asset_idx" ON "connected_devices"("asset_id");

CREATE TABLE IF NOT EXISTS "device_telemetry" (
  "id" BIGSERIAL PRIMARY KEY,
  "device_id" UUID NOT NULL REFERENCES "connected_devices"("id") ON DELETE CASCADE,
  "metric" TEXT NOT NULL,
  "value" DECIMAL(24,6) NOT NULL,
  "unit" TEXT NOT NULL,
  "quality" TEXT NOT NULL DEFAULT 'GOOD',
  "recorded_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "device_telemetry_device_metric_time_idx" ON "device_telemetry"("device_id","metric","recorded_at" DESC);

CREATE TABLE IF NOT EXISTS "device_commands" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL,
  "device_id" UUID NOT NULL REFERENCES "connected_devices"("id") ON DELETE CASCADE,
  "command_type" TEXT NOT NULL,
  "expected_device_version" INTEGER NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
  "reason" TEXT NOT NULL,
  "requested_by" TEXT NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "approved_by" TEXT,
  "request_id" TEXT NOT NULL,
  "trace_id" TEXT NOT NULL,
  "correlation_id" TEXT NOT NULL,
  "external_reference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "device_commands_org_idempotency_idx" ON "device_commands"("organization_id","idempotency_key");
CREATE INDEX IF NOT EXISTS "device_commands_org_state_idx" ON "device_commands"("organization_id","state","created_at" DESC);

CREATE TABLE IF NOT EXISTS "copilot_saved_prompts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "prompt_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id","prompt_id")
);

CREATE TABLE IF NOT EXISTS "copilot_message_feedback" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" UUID NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "value" TEXT NOT NULL CHECK ("value" IN ('helpful','unhelpful')),
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("message_id","user_id")
);
CREATE INDEX IF NOT EXISTS "copilot_feedback_user_time_idx" ON "copilot_message_feedback"("user_id","created_at" DESC);
