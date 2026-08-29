# PowerChain | Digital Energy Infrastructure

**v1.0.0**

PowerChain is a Digital Energy Operating System for physical-energy operations, verified Energy RWA, local markets, metering, Energy Management Systems, settlement, AI-assisted workflows, DePIN and multi-network Solana/Sui infrastructure.

## Description

PowerChain unifies physical energy infrastructure and digital settlement in one production-oriented platform. Operators can monitor assets and digital twins, trade energy and environmental value, automate evidence-backed settlement, and connect enterprise systems with Solana and Sui networks. The repository is a pnpm/Turbo monorepo with one primary Next.js platform, independently deployable services, reusable domain packages, PostgreSQL/Supabase persistence, and infrastructure definitions for local, edge, and cloud deployments.

## Core features

- Local Energy BUY / SELL / RENT with integer-Wh compare-and-set reservations
- First-class Energy Management System (`apps/ems`) plus ERP, CMR, Rewards, Treasury and Vault workspaces
- PowerChain Control Plane, Asset Graph, Device Control, Renewable Revenue Engine and token framework
- CCT on Solana Token-2022 with evidence-backed issuance and retirement boundaries
- Energy Network directory for consumers, prosumers, retailers, renewable generators and grid operators
- Renewable asset operations, telemetry, metering, forecasting, and digital twins
- P2P energy exchange, marketplace checkout, PPAs, credits, and settlement workflows
- PWRC utility token, Sui-bridged wPWRC, and CCT Carbon Credit Token experiences
- Proof of Energy, certification, audit evidence, conformance, and traceability
- Solana and Sui wallet, RPC, liquidity, asset, bridge, and payment integrations
- Helius, Helium, Metaplex, Jupiter, Raydium, Meteora, Orca, Cetus, and Pyth adapters
- Stripe, MoonPay, Coinbase Pay, Solana Pay, and Circle payment boundaries
- AI-assisted operations, protected gateways, WebSockets, workers, and observability
- PostgreSQL/Prisma, Supabase Auth/SSR, tenant-aware access, schemas, and migrations
- Docker, Kubernetes, Terraform, Cloudflare, Vercel, and AWS deployment assets

## Monorepo layout

| Area                                                              | Canonical owner                |
| ----------------------------------------------------------------- | ------------------------------ |
| Production Next.js application and API routes                     | `apps/platform`                |
| First-class Energy Management System                               | `apps/ems`                     |
| Deployable application runtime and HTTP adapter                   | `packages/application-runtime` |
| Configuration, environment parsing, routes, redirects, clusters   | `packages/configuration`       |
| Shared contexts, constants, common components, helpers and errors | `packages/shared`              |
| Reusable PowerChain UI and toast system                           | `packages/ui`                  |
| TypeScript types and all validation schemas                       | `packages/types`               |
| Catalog data, state stores and storage adapters                   | `packages/data`                |
| Application actions and action manifest                           | `packages/actions`             |
| Prisma, migrations, PostgreSQL, Neon and Supabase clients         | `packages/database`            |
| Provider and enterprise integration adapters                      | `packages/integration`         |
| Anchor/Rust programs and network configuration                    | `packages/programs/anchor`     |
| Docker, Kubernetes and Terraform                                  | `packages/infrastructure`      |
| Repository checks, scripts and smoke tests                        | `packages/tooling`             |
| Architecture and engineering artifacts                            | `packages/engineering`         |
| Human-readable documentation and OpenAPI                          | `docs`                         |

The repository root intentionally contains only release documents and the configuration files required by Git, pnpm, Turbo, TypeScript, linting, Docker, and environment bootstrapping. Deprecated root copies are rejected by `pnpm duplicates:check`.

## Requirements

- Node.js 24.19 or newer (below Node 27)
- pnpm 11.22.0
- Rust 1.98.0 and Anchor 1.1.2 for Solana program work
- PostgreSQL 18 and Redis 8 for the local container stack

## Start locally

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. The committed `.env.local` contains safe development defaults only and is ignored by Git; provider secrets must remain local.

Run the complete application fleet when working across service boundaries:

```bash
pnpm dev:all
```

`pnpm dev:services` starts the public web, API, checkout, marketplace, AI,
integration, explorer, WebSocket, and worker services without the platform,
documentation, or Storybook apps. See `docs/architecture/APPLICATIONS.md` for
ports, health endpoints, and service ownership.

## Quality gates

```bash
pnpm validate
pnpm typecheck
pnpm build
```

`pnpm validate` checks routes, redirects, schemas, migrations, program layout, contracts, documentation, interactions, imports, workspace versions, application wiring, and duplicate ownership. `pnpm build` builds every app workspace; `pnpm build:platform` builds only the primary Next.js platform.

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

The Prisma schema and migration history live only in `packages/database/prisma`. Supabase SSR uses publishable/secret keys and cookie `getAll`/`setAll` adapters; legacy anon/service-role environment names are not used.

## Programs

```bash
pnpm programs:check
pnpm programs:check:rust
pnpm programs:build
```

The Rust toolchain is pinned in `packages/programs/anchor/rust-toolchain.toml`. Anchor and Solana network configuration are in the same package.

## Containers

```bash
pnpm docker:build
pnpm docker:up
```

Docker assets are under `packages/infrastructure/docker`; Kubernetes and Terraform definitions share the infrastructure package.

## Cloud deployment

| Target     | Recommended workload                                      | Canonical configuration                      |
| ---------- | --------------------------------------------------------- | -------------------------------------------- |
| Vercel     | Next.js platform and route handlers                       | `packages/infrastructure/vercel/vercel.json` |
| Cloudflare | Edge gateway, caching, WAF, and origin proxy              | `packages/infrastructure/cloudflare`         |
| AWS        | Container fleet on ECS/Fargate with managed data services | `packages/infrastructure/aws`                |
| Kubernetes | Full multi-service fleet                                  | `packages/infrastructure/k8s`                |

Deployment commands, environment boundaries, and provider-specific setup are documented in `docs/deployment/CLOUD-PROVIDERS.md`.

## Documentation

See `docs/README.md` and `docs/WHITEPAPER.md` for architecture, standards, Local Energy, EMS, program, API, security, deployment, and integration guidance. Machine-readable OpenAPI is canonical at `docs/api/swagger.yaml` and can be copied to the app with `pnpm openapi:generate`.

Developer endpoints: `GET /api/swagger/`, `GET /api/v1/openapi.json`, `GET /api/v1/openapi.yaml`, and `GET /api/postman`. Canonical runtime discovery includes `/api/v1/health`, `/api/v1/ready`, `/api/v1/powerchain/overview`, `/api/v1/solana/overview`, `/api/v1/solana/programs`, `/api/v1/solana/market`, and `/api/v1/solana/assets/:mint`.

## Solana website-origin API

The Next.js platform exposes the canonical Solana/PowerChain read surface on the website origin. `/api/v1/solana/overview` reports RPC health, Solana core version, slot, block height, epoch, latest blockhash and genesis hash without exposing RPC URLs. `/api/v1/solana/programs` and `/api/v1/powerchain/programs` verify configured PowerChain/Launchpad program addresses as executable accounts. `/api/v1/solana/assets/:mint` distinguishes SPL Token from Token-2022 and reports supply, decimals, authorities and parsed extensions. `/api/v1/solana/market` requires an explicit mint and resolves sourced market state through Pyth, CoinGecko and CoinMarketCap (with optional Birdeye fallback). The shorter `/api/*` routes remain compatibility aliases over the same server implementation; only `/api/token/market` may default to configured PWRC.

## Security

Never commit API keys, database passwords, private keys, wallet seed phrases, or production RPC credentials. Use server-only environment variables and a deployment secret manager. PowerChain requests wallet signatures and public addresses only; it never needs recovery phrases.

## License

Proprietary software unless a package states otherwise.

## Tokenized Copilot chat proofs

PowerChain Copilot v1.0.0 uses a PWRC-backed internal credit ledger and deterministic response receipts. One completed response equals **1 MSG UNIT = 10,000 PWRC = 10,000,000,000,000 base units**. New chat records are AES-256-GCM encrypted at rest; settled assistant messages bind `quoteHash → reservationId → responseHash → receiptHash → PWRC debit → proofHash`. Proofs are explicitly non-transferable and are not minted assets or financial instruments. See `docs/COPILOT-TOKENIZED-CHAT.md`.
