# Changelog

All notable changes to PowerChain are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## 1.0.0 — 2026-08-28 hardening update

### API developer surface

- Added canonical liveness/readiness: `GET /api/v1/health` and `GET /api/v1/ready`.
- Added project/program/token discovery: `/api/v1/projects`, `/api/v1/projects/:slug`, `/api/v1/programs`, `/api/v1/token/allocations`.
- Added PowerChain runtime discovery: `/api/v1/powerchain/overview` and `/api/v1/powerchain/programs`.
- Added Solana runtime APIs: `/api/v1/solana/overview`, `/programs`, `/market`, and `/assets/:mint`, with compatibility aliases under `/api/solana`, `/api/token`, and `/api/assets`.
- Added browser-safe `GET /api/v1/config/public` and authenticated `GET /api/v1/me`.
- Added `/api/swagger/`, `/api/v1/openapi.json`, `/api/v1/openapi.yaml`, and `/api/postman`, with synchronized OpenAPI/Postman release artifacts.

### Control plane and energy operations

- Added the canonical PowerChain Control Plane, Asset Graph, Device Control, Revenue Engine, Energy Network, EMS, ERP, CMR, Treasury, Vault, Rewards, Local Energy, and Token Framework packages without changing the product version from `1.0.0`.
- Added a first-class `apps/ems` runtime and platform workspaces for EMS, ERP, CMR, rewards, treasury, vault, and Energy Network operations.
- Added database-backed Local Energy `BUY`, `SELL`, and `RENT` listings with integer-Wh accounting, idempotent reservation commands, serializable transactions, version compare-and-set protection, and explicit `REVIEW_REQUIRED -> RESERVED -> DELIVERING -> DELIVERED -> RECONCILED -> SETTLEMENT_READY -> SETTLED` boundaries.
- Added organization-scoped persistence and RLS for the new operational surfaces, including evidence-safe Vault and Asset Graph relationships.

### Tokenization and integrations

- Standardized the PowerChain Carbon Credit Token as `CCT`, defined as a Solana Token-2022 asset with evidence-backed issuance and deployment-blocking configuration until real program/mint authorities are supplied.
- Added canonical SPL Token, Token-2022, Associated Token Account and Metaplex program identifiers to the token framework.
- Added bounded Helius IoT/DePIN observation support and optional Wayfinder research/route evaluation while preserving PowerChain policy, approval, wallet, and physical-meter authority boundaries.
- Added safe environment configuration for PowerChain ACP, Helius, Wayfinder, restricted wallet execution, Copilot credits, Solana/Sui, and industrial/IoT integrations.

### Developer platform and validation

- Expanded `/api/v1` for Energy Network, Local Energy, EMS, ERP, CMR, rewards, treasury, vault, Control Plane, Asset Graph, device intents, revenue quotes and CCT issuance intents.
- Updated OpenAPI and Postman artifacts for the expanded operator API.
- Added Local Energy doctor/verify scripts, release verification, deterministic release-manifest generation, stronger monorepo/docs/OpenAPI checks, and regression tests for reservation and control-plane invariants.
- Regenerated lockfile importer metadata for all workspaces using only existing/workspace resolutions; no registry dependency records were fabricated in the offline validation runtime.

## 1.0.0 — 2026-08-21

### Architecture

- Moved the production Next.js application and API routes into `apps/platform`.
- Consolidated configuration, shared contexts, constants, helpers, errors,
  schemas, data, stores, storage, actions, database clients, integrations,
  engineering assets, contracts, infrastructure, programs, scripts, and tests
  under canonical workspace packages.
- Centralized routes and redirects in the platform routing layer.
- Replaced nine placeholder application shells with independently startable web,
  API, checkout, marketplace, AI, integration, explorer, realtime, and worker
  runtimes built on one shared application contract.
- Reduced the repository root to release documents and required toolchain
  configuration; duplicate canonical owners are rejected during validation.

### Platform

- Added the reusable PowerChain UI package and accessible shadcn-style toast
  provider.
- Added GRIDLLM, Proof of Energy, digital-twin, PPA, certification, settlement,
  energy exchange, metering, DePIN, carbon, and marketplace foundations.
- Added role-aware dashboards, project discovery, wallet adapters, AI provider
  configuration, fixed-point PWRC pricing, and signature-gated transactions.
- Added safe legacy redirects, API CORS handling, and an interaction audit that
  rejects placeholder links, nested controls, and buttons without actions.
- Added a responsive public product entry point with a single Command Center
  conversion path, architecture link, readiness panel, and accessible layout.

### Data and integrations

- Moved Prisma and four canonical migrations to `packages/database/prisma`.
- Added PostgreSQL pooling plus Neon and Supabase server/browser/SSR clients.
- Updated Supabase configuration to publishable and secret keys with SSR cookie
  `getAll`/`setAll` adapters.
- Added isolated adapters for Solana, Sui, Cetus, Helius, Pyth, Jupiter, Circle,
  SAP, SCADA, OPC UA, MQTT, LoRaWAN, and related providers.
- Replaced removed Helius and Sui SDK compatibility exports with canonical
  PowerChain integration adapters.

### Toolchain and delivery

- Released all JavaScript workspaces and Rust crates at version `1.0.0`.
- Updated Node typings to 26.2.0, PostgreSQL `pg` to 8.23.0, WebSocket `ws` to
  8.21.3, Rust to 1.98.0, and Anchor crates to 1.1.2.
- Upgraded TypeScript paths, app-owned Tailwind 4/PostCSS configuration, pnpm
  scripts, frozen-lockfile support, Playwright configuration, and smoke tests.
- Rebuilt container assets around Node 24, PostgreSQL 18, Redis 8, and standalone
  Next.js output; upgraded Kubernetes security, probes, rollout, secrets, and TLS.
- Added canonical OpenAPI, PTSP, program security, deployment, architecture,
  integration, and contributor documentation.

## Prerelease history

- `1.0.0-beta.20`: AI package boundaries, engineering framework, PPA catalog,
  certification shell, project discovery, and protocol foundations.
- `1.0.0-beta.19`: PTSP 5.0, Proof of Energy, digital twins, GRIDLLM, carbon
  exchange, ecosystem operations, and program invariants.
- `1.0.0-beta.18`: Tailwind 4 stabilization, environment/network isolation,
  frozen installs, Playwright hardening, and responsive shell updates.
- `1.0.0-beta.17`: domain libraries, provider settings, network status, Anchor
  configuration, and contract validation.
- `1.0.0-beta.16` and earlier: authentication, wallets, energy exchange,
  smart-grid maps, metering, DePIN, payments, legal pages, and initial migrations.

## Solana API provider hardening

- Added `getLatestBlockhash`/genesis-hash visibility to the Solana cluster overview without exposing RPC URLs or credentials.
- Added on-chain executable-account verification for PowerChain and Launchpad program bindings.
- Added SPL Token vs Token-2022 mint inspection with supply, decimals, mint/freeze authorities and parsed Token-2022 extensions.
- Added deterministic Pyth → CoinGecko → CoinMarketCap → optional Birdeye market resolution.
- Made `/api/v1/solana/market` require an explicit mint; `/api/token/market` remains the PWRC-defaulting compatibility alias.
- Documented the Next.js same-origin proxy boundary keeping Helius, custom RPC, Pyth, CoinGecko and CoinMarketCap credentials server-side.

## Tokenized Copilot chat proofs — v1.0.0 completion layer

- Replaced the legacy in-memory/plaintext chat write path with authenticated PostgreSQL-backed encrypted chat persistence for new records.
- Added deterministic canonical quote hashing, atomic 10,000 PWRC reservation/settlement, one-message-unit accounting, append-only chat credit ledger entries, signed settlement receipts, and deterministic tokenized response proof hashes.
- Extended `AIMessage`/`ai_messages` with quote, response, token-proof, reservation, message-unit, receipt, PWRC debit and reference-value fields plus encrypted-content metadata.
- Added unique proof-hash and receipt lookup indexes, dedicated quote/reservation/unit/receipt/proof/ledger tables, and a legacy plaintext encryption migration tool.
- Added conversation credit summary and message-proof APIs plus `capilot`, `capilot-mobile`, and `copilot-mobile` compatibility aliases that reuse the canonical handlers.
- Added the authenticated proof verification client, conversation credit summary client, overflow-safe proof cards, PWRC/Credits shortcut, and account settings surface.
- Production readiness now fails closed when chat encryption/signing keys are missing or legacy plaintext chat rows remain.
