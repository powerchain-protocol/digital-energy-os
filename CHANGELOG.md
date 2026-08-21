# Changelog

All notable changes to PowerChain are documented here. The project follows
[Semantic Versioning](https://semver.org/).

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
