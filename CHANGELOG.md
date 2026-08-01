
## beta.20.0 — Dashboard fit, project discovery and protocol foundations

- Integrated Certification Center into the shared application shell.
- Added project discovery routes resolving both project IDs and slugs.
- Added project and crowdfunding APIs with explicit MVP metadata.
- Added professional legal document layouts.
- Added checkout, Solana Pay, Blinks, zero-knowledge claim, Renewable SVM and LoRaWAN verification foundations.
- Expanded canonical routes and dashboard navigation.
## 1.0.0-beta.20.0 — Programs and documentation hardening

- Added shared Anchor errors, canonical program events, and cross-domain energy and PWRC supply invariants.
- Exported Proof of Energy, digital-twin, GRIDLLM, error, event, and invariant modules from the canonical program crate.
- Expanded program validation across domain folders, source modules, and critical invariants.
- Rebuilt `PROGRAMS.md` as a professional program architecture and release guide.
- Added canonical documentation navigation plus program security, deployment, and testing guides.
- Added automated documentation validation to the repository verification pipeline.


## AI platform integration — beta.20.0

- Added workspace packages for AI core contracts, AI gateway routing, reusable AI UI, and fixed-point PWRC credits.
- Added GridLLM configuration, model capabilities, BYO provider connection contracts, agents, prompts, memory, and LoRA registries.
- Added AI configuration, provider validation, quote, and settlement APIs.
- Added `/dashboard/ai` routes for chat, agents, prompts, models, LoRA, memory, providers, usage, credits, and settings.
- Added visible per-message pricing configuration at $0.002 and the initial $0.000002 PWRC reference price, yielding 1,000 PWRC per message.
- Added explicit server-side credential and scoped agent-tool boundaries.

## 1.0.0-beta.20.0 — operational hardening update

- Removed the optional root instrumentation hook and added automatic `.next` cache cleanup before development startup.
- Added enterprise data-card and data-table primitives.
- Added typed platform errors, transaction schemas, decimal-safe payment amount utilities, and a signature-gated transaction API.
- Added API CORS middleware and strengthened proxy routing behavior.
- Added a server-safe Cetus Sui CLMM adapter with mainnet/testnet and custom full-node support.
- Added configuration, integration, and data-component documentation.
# Changelog
## 1.0.0-beta.20.0 — Stabilization update

- Removed the instrumentation-time dependency on the observability module so Turbopack can always compile the root instrumentation hook.
- Added the canonical `src/store/` provider and public barrel.
- Restored and typed dashboard metrics, role dashboard data, wallet-provider adapters, and observability compatibility modules.
- Added regression checks for build-critical application modules.


## 1.0.0-beta.19.4

- Added the PowerChain Technical Standards Program (PTSP) 5.0 Draft portfolio.
- Added normative document classifications, publication lifecycle and compatibility policy.
- Added Core, Utility, Commercial, Edge, Cloud and Research conformance profiles.
- Added permanent governance charters for architecture, standards, engineering, conformance and security.
- Added a machine-readable standards catalog and requirements traceability matrix.
- Added `/standards` and `/api/v1/standards/catalog`.
- Added PTSP validation and regression tests.

## 1.0.0-beta.19.1

- Added six-pillar PowerChain ecosystem operations architecture.
- Split Proof-of-Energy into measurement, validation, attestation, verification and settlement modules.
- Added metering integrity, IoT gateway encryption, DePIN consensus, tokenization and settlement libraries.
- Added canonical measurement, attestation, energy-token and settlement APIs.
- Added PWRC/WPWRC participant fee and reward model with global leaderboard.
- Added ecosystem, tokenization, blockchain and leaderboard workspaces.
- Added domain-oriented Solana program layout and invariant documentation.


## 1.0.0-beta.19.0

- Added GRIDLLM AI Energy Intelligence workspace, typed model predictions, optimization actions, and forecast APIs.
- Added Proof-of-Energy measurement, oracle-attestation, minting, marketplace, and settlement architecture.
- Added renewable asset digital-twin registry, portfolio dashboard, detail routes, and APIs.
- Added Solana program primitives for proof-of-energy, digital twins, and auditable AI recommendations.
- Added domain contracts for GRIDLLM, digital twins, and single-issuance energy tokenization.

## 1.0.0-beta.18.10

- Added the PowerChain Carbon Exchange dashboard, registry, project portfolio, trading activity, verification pipeline, carbon APIs, lifecycle types, and calculation utilities.
- Added role-aware Carbon Exchange navigation and enterprise carbon analytics.

## 1.0.0-beta.18.9

- Refined the responsive application shell, centralized navigation, moved workspace identity into the header, added sidebar logout, live status streaming, organized energy routes, and upgraded smart-grid mapping.

# Changelog

## 1.0.0-beta.18.7

- Stabilized the Tailwind CSS 4 and PostCSS pipeline with a single canonical `postcss.config.mjs`.
- Added a pre-development and pre-build CSS configuration guard that rejects stale PostCSS files and Tailwind 3 directives.
- Added the required `@tailwindcss/postcss` dependency and synchronized Tailwind/PostCSS versions.
- Expanded pnpm lifecycle build approvals for required Solana native dependencies.
- Added a server-only runtime helper for typed Solana and Sui network selection.
- Added `doctor`, `css:check`, and dependency rebuild scripts.
- Updated Docker and package versions to beta.18.7.

## v1.0.0-beta.18.6 — Frozen install and Playwright stabilization

- Added pnpm frozen-lockfile install scripts for deterministic CI installs.
- Updated Playwright to start the application with `pnpm run dev`.
- Isolated Playwright typing through `tsconfig.e2e.json` and Node types.
- Added CI-safe retries, workers, reporting, screenshots, videos, and web-server timeout settings.


## 1.0.0-beta.18.6 — Environment and network stabilization

- Added explicit Node.js typings to the primary TypeScript project.
- Isolated Playwright configuration and tests in `tsconfig.e2e.json`.
- Split environment handling into browser-safe and server-only modules under `src/env/`.
- Added Solana devnet, mainnet-beta, custom RPC, Helius RPC, and program-ID configuration.
- Added Sui devnet, testnet, mainnet, and custom RPC configuration.
- Added server-side RPC resolution that keeps API keys out of client bundles.
- Expanded `.env.example`, network status APIs, and configuration validation.


## 1.0.0-beta.17.1

- Reorganized root auth, IoT and DePIN modules into domain libraries.
- Added devnet, mainnet-beta and secure custom RPC configuration.
- Added Helius RPC/API client support and user integration settings.
- Added custom AI provider, model, base URL and API-key settings.
- Added network and platform-status API endpoints.
- Added Anchor.toml, Anchor JS dependency and upgraded Rust contract configuration.
- Added Playwright dependency and contract/config validation scripts.
- Hardened Next.js headers and optimized package imports.
- Expanded environment validation and documentation.

## 1.0.0-beta.16

- Added role-scoped demo accounts and expanded authentication profiles.
- Added user management, organization roles and tier visibility.
- Added pricing UI and SaaS integration registry.
- Added PowerChain API client, token, currency, asset, renewable and IoT libraries.
- Added wallet portfolio pricing and signature endpoint.
- Added professional chart and data-card components.
- Added fixed application header and footer, white light-theme surfaces, responsive hamburger behavior and collapsible icon-only sidebar.
- Improved safe redirects, routing, scroll containment and scrollbar styling.


## 1.0.0-beta.14

### Added

- Worldwide smart-grid infrastructure search and responsive map workspace.
- Renewable map covering power plants, wind farms, solar plants, tokenized Solana plants, EV chargers, smart meters, and Helium hotspots.
- Smart-meter workspace with IoT telemetry hook and explicit fallback state.
- Helium and LoRaWAN provider-isolated integration adapters.
- DePIN network workspace, node contracts, and PWRC reward visibility.
- Solana Blink helper for renewable project funding actions.
- Versioned map, IoT, and DePIN API endpoints.
- Smart-grid, metering, and DePIN Anchor-compatible program modules.
- Professional root, program, and integration documentation.

### Changed

- Expanded Radix-icon sidebar navigation for maps, metering, renewables, and DePIN.
- Updated package, Docker, shell, and navigation versions to beta.14.
- Reframed documentation around Pages Router UI architecture and production boundaries.

## 1.0.0-beta.9 - 2026-07-31

### Added
- Tokenized energy exchange domain, market table, order ticket, and API endpoint.
- Central design-token and responsive utility styles.
- Account, wallet, partnership, and reusable API client modules.
- Legal privacy, terms, and cookie pages with accessible consent controls.
- Global UI error boundary and recovery actions.
- Exchange and partnership database migrations for Prisma, Supabase, and SQL deployments.
- Migration validation script.

### Improved
- Global application composition, resilience, responsive UX, and accessibility.

All notable changes to PowerChain Platform are documented here.

## [1.0.0-beta.1] - 2026-07-31

### Added
- Versioned App Router API under `/api/v1` for status, metrics, prices, alarms, and wallet sessions.
- Wallet provider, wallet button, and accessible wallet connection modal.
- Global loading, not-found, redirect, and PWA support.
- Installable web-app manifest and generated application icons.
- Shared server utilities for safe actions, rate limiting, database access, RPC providers, pricing, Solana, Pyth, Helius, and email delivery.
- Reusable email template and `useMail` client hook.
- Improved logo variants, responsive behavior, defensive validation, and typed API responses.

### Changed
- Package version advanced from `1.0.0-beta.0` to `1.0.0-beta.1`.
- README expanded with architecture, setup, environment, API, and security guidance.

## [1.0.0-beta.0]
- Initial Next.js 16 enterprise beta shell and renewable-energy workspaces.

## [1.0.0-beta.2] - 2026-07-31

### Added
- Typed environment validation in `/env`.
- Lightweight global platform store in `/store`.
- Typed action contracts and searchable action registry.
- Centralized PowerChain AI client abstraction and React provider.
- AI operations, chat, and renewables workspaces.
- Shared workspace header and statistic-card primitives.
- Safe mock AI fallback for local and credential-free development.

### Improved
- Provider composition now includes AI and platform state layers.
- Architecture better separates domain pages, common UI, state, environment, and integrations.
- Package version advanced to `1.0.0-beta.2`.

## 1.0.0-beta.3 - 2026-07-31

### Added
- Prisma schema and PostgreSQL data model for organizations, assets, and telemetry.
- Supabase browser/admin clients and migration scaffold.
- Neon serverless SQL adapter and database repository layer.
- Zod database and analytics schemas.
- SQL migration, seed, environment-check, and migration scripts.
- Anchor/Solana registry program scaffold under `programs/src`.
- Responsive analytics workspace and reusable analytics components.

### Improved
- Database provider boundaries, typed validation, deployment configuration, and operational documentation.

## [1.0.0-beta.4] - 2026-07-31

### Added
- Security middleware with request IDs, CSP, clickjacking protection, referrer policy, and permissions policy.
- Health and readiness API endpoints for infrastructure probes.
- Structured JSON logger and role-based permission matrix.
- Environment-driven feature flags for staged enterprise releases.
- App Router error boundaries and reusable accessible empty state.
- Formatting hygiene and smoke-test scripts.
- Reduced-motion, focus-visible, and selection accessibility refinements.

### Changed
- Platform status bar now reports v1.0.0-beta.4.
- Expanded environment template with feature controls.

## 1.0.0-beta.5 - 2026-07-31

### Added
- Central responsive breakpoint registry from 360px through 1920px.
- `useBreakpoint`, `useBreakpointDown`, and `useViewport` hooks.
- Shared responsive container and grid utilities.
- Breakpoint synchronization tests.

### Changed
- Upgraded TypeScript configuration for Next.js bundler resolution and TypeScript 6 deprecation compatibility.
- Expanded Tailwind content discovery to App Router, hooks, and MDX files.
- Updated the legacy mobile hook to use the centralized breakpoint system.

## 1.0.0-beta.6 - 2026-07-31

### Added
- Multi-tenant organization context and tenant-aware RBAC permission matrix.
- Audit event writer and activity-history foundation.
- Renewable-asset digital twin, GIS map, live SSE telemetry, and incident UI components.
- SCADA connector interfaces with OPC UA and MQTT adapter scaffolds.
- Plugin registry and background-job queue contracts.
- PWRC utility/governance token and CCT carbon-credit token assets and portfolio cards.
- Enterprise API endpoints for organizations, assets, alerts, telemetry, plugins, OpenAPI, and Prometheus metrics.
- Internationalization message foundation for English, Spanish, German, and French.
- Playwright end-to-end tests and Storybook accessibility configuration.
- GitHub Actions CI, Docker Compose, Kubernetes, and Terraform deployment scaffolds.
- OpenTelemetry-compatible tracing helpers and Prometheus metrics endpoint.
- PWA manifest route, WCAG skip navigation, semantic live regions, and improved focus behavior.
- Central `/routes`, `/routers`, and safe `/redirect` helpers.

### Changed
- Package version upgraded to `1.0.0-beta.6`.
- Enterprise overview redesigned for responsive control-room, desktop, tablet, and mobile layouts.

## 1.0.0-beta.8

- Fixed duplicate `/analytics` App Router/Pages Router route.
- Replaced deprecated root middleware with Next.js 16 `proxy.ts` and modular `/middleware` policies.
- Removed hard dependency on Radix Dialog from wallet connection flow.
- Added resilient instrumentation fallback and restored `aiInsights` compatibility export.
- Added Solana/Sui account, balance, token-account, signature, pricing, connection and SSE telemetry endpoints.
- Added wallet hooks, chain clients, SAP integration, payments, protocol contracts, validation, identifiers, slugs, avatars and upload handling.
- Upgraded authentication screen and responsive enterprise UX.

## 1.0.0-beta.11 - 2026-07-31

### Added
- Organized sidebar categories, product title, workspace identity, and improved active navigation.
- Shared accessible `Tabs` and multi-variant `Button` components.
- Settings-based profile overview, company information, organization, users, roles, tiers, and theme management.
- Role-specific dashboard presets for consumers, prosumers, companies, admins, super admins, and P2P clients.
- P2P renewable-energy marketplace, offer detail pages, project crowdfunding, identified project routes, and case studies.
- Dark Green, Onyx, Black, White, Signal Red, and Framed dashboard themes.

### Changed
- Moved profile navigation into Settings and redirected `/profile` to `/settings`.
- Updated platform version surfaces to beta.10.

### Removed
- Deprecated root `middleware.ts`; root request handling remains in `proxy.ts`.

## 1.0.0-beta.11

### Stabilization
- Removed the deprecated root `middleware.ts`; Next.js 16 request interception now uses only `proxy.ts`.
- Standardized all user-interface routes on the Pages Router, including `/analytics`.
- Reserved `app/api/v1` for Route Handlers and moved shared UI, providers, energy exchange modules, and server utilities out of `app/`.
- Replaced the Radix-dependent wallet connector with the internal accessible dialog implementation.
- Added `lib/observability/tracing.ts` and resilient instrumentation registration.
- Restored the public `aiInsights` export used by the dashboard.
- Replaced direct Solana and Sui SDK coupling with timeout-protected JSON-RPC clients and fallbacks.
- Added a routing/build preflight that rejects duplicate App Router UI routes, deprecated middleware, missing tracing, and wallet-dialog regressions.

## 1.0.0-beta.12

- Added `@web3icons/react` and centralized Web3 token, network, and wallet icon components.
- Added public root assets `/PWRC.png` and `/CCT.png` and made them the canonical custom token artwork.
- Added branded icons for SOL, SUI, USDC, Solana, Sui, Phantom, Solflare, and Backpack with accessible fallbacks.
- Replaced the legacy secondary network with Sui and removed unsupported legacy assets from the treasury interface.
- Upgraded the wallet page with a multi-chain asset list and explicit network policy.
- Migrated the complete sidebar and wallet action iconography to Radix Icons.

## 1.0.0-beta.14

### Added

- Secure sign-in and sign-up workspaces with server-issued HttpOnly sessions.
- Session, authentication, sign-out, and CORS API endpoints.
- Solana wallet snapshot service for balances, SPL accounts, and recent signatures.
- Wallet data hook, account security page, and payment balance safeguards.
- Shared auth, wallet, security, hooks, data, services, and type contracts.

### Improved

- Rebuilt the wallet connection modal with valid TypeScript and Solana base58 validation.
- Organized application context into app, auth, wallet, theme, AI, and platform-store providers.
- Upgraded wallet and account experiences with explicit RPC fallback status.
- Hardened amount validation so zero, negative, and insufficient-balance purchases are rejected.

## 1.0.0-beta.15

- Added multi-tenant role permissions, role-aware navigation and role-specific dashboards.
- Added tier and pricing catalogs with `/api/v1/tiers` and `/api/v1/pricing`.
- Added AI model contracts for LLM, LoRA and secure MPC workloads.
- Added renewables agent, chat UI, prompt library, saved prompts and message components.
- Added chat APIs with chat, user and message identifiers.
- Expanded Prisma schemas and migrations for users, memberships, chats and messages.
- Added governance, registry and treasury program modules plus `PROGRAMS.md`.
- Added schema, program and OpenAPI validation scripts.

## 1.0.0-beta.17.1

- Fixed Turbopack instrumentation resolution by using a static tracing import.
- Removed unsupported `@web3icons/react/dynamic` subpath imports.
- Added dependency-safe token, network, and wallet icon fallbacks.
- Replaced the unavailable Radix `MapIcon` export with `SewingPinIcon`.
- Restored successful compilation of the root dashboard import graph.


## 1.0.0-beta.18.2

- Fixed Next.js instrumentation by replacing the alias import with a direct relative import.
- Added local branded wallet icons for Phantom, Solflare, Backpack and Glow.
- Added local-first network and token icons with CoinMarketCap and Cryptoicons HTTPS fallbacks.
- Allowlisted approved remote icon hosts in `next.config.ts`.
- Removed the unused `@web3icons/react` dependency and package-import optimization entry.
- Moved dashboard assets, auth, IoT, roles and security modules into `lib/workspaces/dashboard/`.
- Updated all affected imports, tests and documentation.

## 1.0.0-beta.18.2 — structure maintenance

- Moved shared helper functions from the repository root into `utils/helpers.ts`.
- Added `utils/assets.ts` for local-first token, network and wallet asset resolution.
- Added `utils/errors.ts` with typed application errors and safe serialization helpers.
- Added a `utils/index.ts` barrel for stable imports.
- Hardened the PowerChain API client with normalized timeout and transport errors.
- Expanded centralized route definitions and added permanent redirects for legacy login and profile URLs.
- Added structure regression checks while retaining the beta.18.2 release line.

### Refactor — source organization and routing

- Migrated application source into `src/` with `@/*` resolving to `src/*`.
- Moved validation to `src/types/validate.ts` and AI contracts to `src/types/ai/`.
- Consolidated all API endpoints under `src/app/api/v1`; removed mixed Pages Router API handlers.
- Removed legacy `/login` and `/profile` page files in favor of centralized Next.js redirects.
- Updated Tailwind scanning, instrumentation imports, scripts, and tests for the new structure.


### Beta.18 App Router and migration consolidation

- UI routes now use the Next.js App Router under `src/app`.
- `src/pages` was removed.
- Database history is canonical under `prisma/migrations`; duplicate `migration`, `migrations`, and `supabase/migrations` directories were removed.
- Administration UI code is organized under `src/workspaces/admin`.

## 1.0.0-beta.18.2 — App Router consolidation

- Migrated all user-facing routes from `src/pages` to `src/app`.
- Added a root App Router layout and shared client provider boundary.
- Replaced legacy `next/router` usage with `next/navigation`.
- Converted dynamic marketplace and project pages to App Router parameter handling.
- Consolidated all SQL migration history under `prisma/migrations`.
- Removed duplicate `migration`, `migrations`, `database/migrations`, and `supabase/migrations` directories.
- Moved administration UI modules into `src/workspaces/admin`.
- Updated routing, migration, and smoke-test validation scripts.

## 1.0.0-beta.18.2

- Rebuilt the sign-in experience as responsive React/Tailwind code based on the supplied PowerChain visual direction.
- Added a branded renewable-energy visual panel, accessible password controls, social sign-in affordances, secure redirect validation, remembered-session option, and demo-account disclosure.
- Added a password-reset route and upgraded authentication responsive behavior.
- Redesigned the overview dashboard with global grid operations, live system status, generation KPIs, AI recommendations, operational assets, generation mix, and responsive data visualization panels.
- Added mobile, tablet, desktop, dark-theme, focus, and reduced-motion refinements.

## 1.0.0-beta.18.3
- Added local peer-to-peer energy trading for buying, selling, and renting renewable capacity.
- Added proximity filters, local matching, trade pricing, fees, carbon estimates, and wallet-signature order state.
- Added `/p2p-energy`, `/api/v1/p2p/listings`, and `/api/v1/p2p/orders`.
- Added canonical Prisma models and migration for P2P listings and orders.

## 1.0.0-beta.18.4

### Added
- Energy-community summary metrics for local supply, demand, members, match rate, average price, and avoided carbon.
- Meter-verified P2P offers with settlement-asset metadata for USDC, PWRC, and fiat workflows.
- Escrow-aware pricing with explicit network fee and settlement reserve.
- P2P activity view with metering and settlement lifecycle states.
- P2P community and order-detail API routes.
- Order quantity validation, optional Solana wallet validation, and structured settlement updates.

### Improved
- Local matching now considers verification, delivery confidence, distance, renewable content, and price.
- Rental offers now expose capacity slots, deposits, and billing periods.
- P2P marketplace accessibility, responsive behavior, filtering, and transaction clarity.

## 1.0.0-beta.18.5

### Distributed Energy Exchange
- Added a multi-market PowerChain Exchange covering energy, storage, charging, carbon, certificates, flexibility, capacity and hydrogen.
- Added live order book, clearing-price, liquidity, transaction and settlement foundations.
- Added exchange dashboard, listing, order-book, trade and settlement APIs.

### Smart Meter & Edge Platform
- Upgraded smart meters into a digital edge operations center with live energy flow, meter health, communications and power-quality views.
- Added smart-meter and power-quality APIs plus telemetry validation and health scoring.

### Organizations & Participants
- Added a unified participant model for consumers, prosumers, providers, enterprises, utilities, communities, partners and regulators.
- Added role-aware participant management and API access.

## 1.0.0-beta.18.6

### Added
- Enterprise marketplace service layer and typed participant, match, grid-validation, order, and domain-event contracts.
- Grid-aware listing ranking, delivery validation, settlement calculations, and marketplace recommendations.
- Marketplace-compatible API namespace for dashboard, listings, orders, order book, trades, settlements, and recommendations.
- In-process immutable marketplace event log foundation with correlation metadata.
- `docs/architecture/MARKETPLACE.md` covering runtime layers, event policy, workflow, security, and production evolution.

### Changed
- Package and container release versions updated to beta.18.6.

### Tooling and integration hardening
- Standardized the repository on pnpm 11.18.0 through `packageManager`, engine metadata, and pnpm-native scripts.
- Added `pnpm-workspace.yaml` with an explicit lifecycle-build allow-list for Prisma, Sharp, and esbuild.
- Added Solana Wallet Adapter, Sui TypeScript SDK, Helius SDK, and Pyth Hermes client dependencies.
- Removed deprecated TypeScript `baseUrl` usage and enabled the TypeScript 6 deprecation compatibility setting.
- Fixed root `proxy.ts` middleware resolution by using stable relative imports into `src/middleware`.
- Added application routing documentation and integration entrypoints for Solana, Sui, Helius, and Pyth.

## 1.0.0-beta.18.6 — pnpm/Web3 icon stabilization

- Added `@web3icons/react` for wallet, token, and network brand assets.
- Updated pnpm 11 workspace policy to use `allowBuilds` instead of the removed `onlyBuiltDependencies` setting.
- Set `minimumReleaseAge: 0` for development so reviewed packages published within the last 24 hours do not block dependency restoration.
- Added explicit locked-install and policy-inspection scripts.

### Infrastructure and program tooling

- Added Supabase SSR, browser, and admin clients with server-only service-role handling.
- Added Pino structured logging and `pino-pretty` development output.
- Added migration orchestration metadata while retaining `prisma/migrations` as the only canonical history.
- Added Zod network and program configuration schemas.
- Added Solana devnet and mainnet-beta program targets and deterministic target resolution.
- Added program settlement/carbon calculation primitives and regression tests.
- Added TypeScript 6 deprecation handling and Node globals to the main compiler configuration.

## 1.0.0-beta.18.8

- Added hardware fleet, device product catalog, and firmware management workspaces.
- Added typed hardware and firmware domain models with reusable tables.
- Added canonical routes and role-aware sidebar navigation for device operations.
- Added an automatic PostCSS cleanup guard so stale `postcss.config.js` files no longer block development or production builds.
- Updated package and Docker release versions.

## 1.0.0-beta.19.2 — Renewable Energy Intelligence Cloud

### Added

- Canonical Foundation, Cloud, Fabric, Runtime, Domain, Intelligence, Operations, Developer, Experience and Shared source layers.
- `/platform` enterprise capability catalog with responsive search and layer filters.
- Platform capability metadata covering foundations, clouds, fabrics, runtimes, studios, hubs, marketplaces, intelligence, experience and ecosystem services.
- `GET /api/v1/platform/catalog` for machine-readable platform discovery.
- Five strategic-pillar presentation for energy, digital, financial, enterprise and ecosystem infrastructure.
- Regression tests for architecture layers, route registration and API availability.

### Changed

- Added the Renewable Energy Intelligence Cloud to the role-aware sidebar.
- Updated package and container versions to `1.0.0-beta.19.2`.

## 1.0.0-beta.19.3

- Added PowerChain Platform Architecture (PPA) 3.0 Draft documentation.
- Added architecture contracts, standards catalog, reference-model catalog, governance, quality and conformance documentation.
- Added authoritative engineering artifacts and a JSON Schema for architecture contracts.
- Added the `/architecture` framework workspace and `/api/v1/architecture/catalog` endpoint.
- Added architecture artifact validation and regression tests.

## 1.0.0-beta.19.5

### Added

- PowerChain Engineering Framework (PEF) 1.0 Draft workspace and API catalog.
- Consolidated public programs: PAF, PPS, PEP, and the Platform Reference Implementation.
- PowerChain Foundation Blueprint constitutional principles and hierarchy.
- Permanent governance-body charters and coordinated publication model.
- Residential, commercial, industrial, utility, edge, cloud, and research architecture profiles.
- Capability ownership registry and published ecosystem-health metrics.
- Machine-readable framework knowledge graph connecting principles to certification profiles.
- Framework validation tooling and regression tests.

### Changed

- Navigation now presents the Engineering Framework as the public entry point while retaining detailed architecture and standards workspaces.
- Platform version and Docker tag updated to beta.19.5.

## 1.0.0-beta.20.0

### Added

- Responsive sign-in and sign-up experiences using the supplied PowerChain branding and renewable-energy visual assets.
- Shared email/password validation, password visibility controls, remember-me support, and accessible error states.
- Google and Microsoft authentication entry points plus a Web3 sign-in flow.
- Radix Dialog-based wallet connection modal with focus management and keyboard dismissal.
- Solana, Sui, and EVM wallet-provider abstraction with injected-provider detection, watch-only addresses, persisted connected state, and disconnect support.
- Production integration guidance for OAuth, wallet challenge signing, secret management, session storage, RPC providers, and asset hosting.

### Changed

- Updated the reference application and container release to `1.0.0-beta.20.0`.
- Expanded the wallet session API to validate Solana, Sui, and EVM public addresses.

## 1.0.0-beta.20.0 — structure and runtime stabilization

- Moved Supabase clients into `src/lib/database/supabase` and removed the stale top-level Supabase folder.
- Moved the wallet provider into `src/components/provider`.
- Consolidated schemas, routes, context, constants, shared exports, and skills.
- Hardened Node global typing through `@types/node`, `types: ["node"]`, and an explicit Node type reference.
- Upgraded Docker to a pnpm 11 multi-stage standalone build with health checks and non-root runtime.
- Updated Swagger metadata and authentication/wallet endpoints.
- Added repository structure validation.

### beta.20.0 stabilization update

- Prevented role dashboard crashes by defining and safely defaulting quick actions.
- Added polished App Router loading, error, and not-found experiences.
- Added framework-neutral Storybook preview configuration.
- Added typed platform worker registry and workspace public API.
- Added ESLint 10.8.0 and Prettier 3.9.6.
- Kept Prisma Client and CLI aligned at 6.19.3; Prisma 7 remains an explicit future migration.
- Added a command to disable anonymous Next.js telemetry.

## 1.0.0-beta.20.0 — enterprise UI refinement

- Refined the PowerChain wordmark with semibold “Power” and light “Chain” typography.
- Removed the desktop hamburger/collapse control from the fixed header and added a dedicated GRIDLLM bot icon.
- Restyled the wallet-connect action in PowerChain dark green.
- Added bounded 2,000-character AI chat input, PowerChain-domain guardrails, upload/link controls, model details, and AI settings access.
- Added PWRC, wPWRC, and CCT tokenomics workspaces with token selectors, mini heroes, token details, reference pricing, and utility information.
- Added reusable badges, inputs, data cards, improved tabs, and refined button/card radii.
- Added a typed contribution leaderboard and upgraded the rewards workspace.
- Fixed organization tier access by resolving the enterprise tier through `getTier`.
- Upgraded project and crowdfunding cards with branded image placeholders, locations, capacity, financing progress, and richer project metadata.
- Removed separate AI and network entries from sidebar navigation; configuration remains under Settings.

## 1.0.0-beta.20.0 — Documentation, AI and PWRC bridge refinement

- Added the in-app References and Documentation workspace with architecture, API, AI, token and legal sections.
- Moved architecture, engineering framework, technical standards and legal navigation into the References sidebar group.
- Added README brand artwork and Operations Center screenshot assets.
- Added GRIDLLM model, agent and skill catalogs with PowerChain-only prompt validation.
- Added PWRC PowerChain-to-Solana bridge quote and transfer APIs, supply-invariant logic, program scaffold and contract metadata.
- Rebuilt the OpenAPI document with valid path structure and bridge, AI and Proof-of-Energy endpoints.

## UI/UX refinement

- Refined the platform shell, header, navigation, cards, tabs, buttons, chat workspace, accessibility, responsive behavior, loading states and mobile layouts.
- Added reusable section heading and skeleton primitives.
- Added skip navigation, improved focus states, notification visibility, command-menu access and resilient AI error feedback.

### UI/UX marketplace and governance refinement

- Added currency and distance-unit selectors in the global header.
- Added a PWRC-branded avatar component and simplified duplicate header actions.
- Rebuilt the Energy Marketplace with renewable-image cards, filters, market intelligence, map preview, and an order-review dialog.
- Added an institutional Governance workspace for proposals, voting, delegates, and treasury allocation.
- Integrated device products into the shared dashboard shell.
- Added MVP disclosures to projects, crowdfunding, profile settings, and project cards.
- Expanded legal footer navigation with Cookies and Legal references.
- Softened sidebar active-state styling and standardized card/button radii.

## beta.20.0 certification and settlement update

- Added Certification Center, tokenized certificate lifecycle, energy tariff APIs, SAP tariff adapter, Token-2022 metadata profiles, decimal-safe payments, certificate registry program primitives, and OpenAPI coverage.

## beta.20.0 — Web3 integration and Turbopack stabilization

- Added provider-isolated adapters for Onramp, Circle, Pyth, Jupiter, Raydium, Orca, Meteora, Helius, Metaplex, Helium, Cetus, and Streamflow.
- Split normative contract documentation from machine-readable contract artifacts and executable logic.
- Removed the legacy webpack callback and configured Turbopack explicitly for Next.js 16.
- Refined the canonical Proof of Energy settlement pipeline and marketplace visual hierarchy.
