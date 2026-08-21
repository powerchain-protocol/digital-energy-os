# PowerChain 1.0.0

PowerChain is a renewable-energy operating system for asset operations, energy markets, metering, tokenization, settlement, AI-assisted workflows, and multi-network Web3 integrations.

## Description

PowerChain unifies physical energy infrastructure and digital settlement in one production-oriented platform. Operators can monitor assets and digital twins, trade energy and environmental value, automate evidence-backed settlement, and connect enterprise systems with Solana and Sui networks. The repository is a pnpm/Turbo monorepo with one primary Next.js platform, independently deployable services, reusable domain packages, PostgreSQL/Supabase persistence, and infrastructure definitions for local, edge, and cloud deployments.

## Core features

- Renewable asset operations, telemetry, metering, forecasting, and digital twins
- P2P energy exchange, marketplace checkout, PPAs, credits, and settlement workflows
- PWRC utility token, Sui-bridged wPWRC, and CRT carbon credit token experiences
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

See `docs/README.md` for architecture, standards, program, API, security, deployment, and integration guidance. Machine-readable OpenAPI is canonical at `docs/api/swagger.yaml` and can be copied to the app with `pnpm openapi:generate`.

## Security

Never commit API keys, database passwords, private keys, wallet seed phrases, or production RPC credentials. Use server-only environment variables and a deployment secret manager. PowerChain requests wallet signatures and public addresses only; it never needs recovery phrases.

## License

Proprietary software unless a package states otherwise.
