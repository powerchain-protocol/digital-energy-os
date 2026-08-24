# PowerChain Digital Energy OS v1.0.0 — Canonical Validation

## Release identity

```text
Product: PowerChain Digital Energy OS
Version: 1.0.0
Copilot: PowerChain Copilot
Canonical energy unit: Wh
API namespace: /api/v1
Energy RWA metadata: PET-20
Energy RWA asset class: VERIFIED_ENERGY_POSITION
Backing ledger: POWERCHAIN_ENERGY_LEDGER
```

The repository uses one canonical product version. Internal implementation revision labels are not used in the release identity.

## Integrated operating architecture

```text
Physical Infrastructure
        ↓
Telemetry / Meter Evidence
        ↓
Operational Digital Twin
        ↓
Validated Energy Proof
        ↓
Finalized Energy Batch
        ↓
Canonical Energy Position
        ↓
PET-20 Energy RWA
        ↓
Reservation
        ↓
Physical Delivery
        ↓
Reconciliation
        ↓
Settlement Review + Maker/Checker
        ↓
Financial Settlement
        ↓
Retirement
```

PowerChain Copilot sits above authoritative product domains:

```text
Operator
   ↓
POWERCHAIN COPILOT
Ask · Analyze · Research · Act
   ↓
RWA ORCHESTRATOR
   ↓
Specialist Agents
   ↓
Reusable Skills
   ↓
Digital Energy OS / Energy RWA / Treasury / Projects / Documents
   ↓
Evidence, findings, or reviewable action draft
   ↓
Human approval
   ↓
External wallet signature if required
```

## Canonical Copilot verification

Verified:

- dedicated `/copilot/architecture` workspace using the canonical public architecture image;
- global Copilot header control and right-side workspace;
- route-aware context;
- structured context references;
- Ask / Analyze / Research / Act modes;
- contextual suggestions;
- visible RWA Orchestrator plans and agent activity;
- Asset Researcher;
- Asset Analyst;
- Risk Agent;
- Capital Agent;
- Operator Agent;
- Verification Agent;
- Document Intelligence Agent;
- Reporting Agent;
- Impact Agent;
- Launch Agent;
- reusable skills layer;
- prompt library;
- draft-only Agent Builder;
- organization-isolated Action Center;
- PostgreSQL Action Center persistence in LIVE mode;
- human decision actor audit;
- atomic action decision transitions;
- external-wallet reference recording;
- safe provider-vs-fallback execution state;
- canonical product catalog and Products page;
- compatibility routing from legacy AI/chat surfaces.


## Local Energy OS verification

Verified:

- canonical `@powerchain/local-energy` v1.0.0 package;
- canonical Local Energy PostgreSQL persistence for listings, orders, flexibility, audit and idempotency;
- atomic listing-capacity reservation using advisory transaction locks and row locking;
- idempotency-key conflict detection for changed request payloads;
- fail-closed LIVE database behavior;
- truthful `UNAVAILABLE` live aggregate telemetry rather than demo-to-live relabeling;
- Wh as the canonical internal energy unit;
- community/prosumer/consumer/grid-operator participant contracts;
- grid-constrained local import/export commitments;
- `/local-energy` command center;
- `/local-energy/marketplace`;
- `/local-energy/grid`;
- `/local-energy/devices`;
- `/local-energy/settlement`;
- `/api/v1/local-energy/overview`;
- `/p2p-energy` compatibility routing;
- Local Energy OS as a canonical PowerChain product;
- Local Energy contextual suggestions in PowerChain Copilot;
- explicit physical-energy, evidence, market, financial, blockchain and reward domain separation;
- meter-evidence-first delivery/settlement semantics;
- battery discharge does not create new renewable provenance.

Canonical Local Energy flow:

```text
Measure
→ Verify
→ Locate
→ Prove
→ Position
→ Reserve
→ Route
→ Trade
→ Deliver
→ Reconcile
→ Settle
→ Retire
→ Reward
```


### Local Energy order control chain

```text
REVIEW_REQUIRED
→ RESERVED
→ DELIVERING
→ DELIVERED
→ RECONCILED
→ SETTLEMENT_READY
→ SETTLED
```

Verified safeguards:

```text
inventory reservation is atomic
economic writes require Idempotency-Key
meter evidence is mandatory before reconciliation
reconciliation is mandatory before settlement readiness
external settlement reference is mandatory before SETTLED
early cancellation returns reserved listing capacity
wallet/payment confirmation does not prove delivery
```

LIVE community aggregate metrics are never sourced from the demo catalog. When no live aggregate source is configured they are explicitly `UNAVAILABLE`.

## Copilot control boundary

```text
READ
↓
ANALYZE
↓
DRAFT
↓
RECOMMEND
↓
REQUEST APPROVAL
↓
HUMAN APPROVES
↓
WALLET SIGNS EXTERNALLY
```

Verified safeguards:

```text
NO_SILENT_FUND_MOVEMENT
NO_SILENT_CRITICAL_RECORD_CHANGE
NO_AGENT_WALLET_SIGNATURE
EXPLICIT_HUMAN_APPROVAL_FOR_HIGH_IMPACT_ACTIONS
```

Copilot does not become a source of physical-energy truth, settlement truth, chain truth, or wallet authority.

## Digital Energy invariants

```text
Physical energy remains authoritative.

Electricity
≠ Energy RWA
≠ Delivery
≠ Money
≠ PWRC
≠ wPWRC

Active Solana represented Wh
+
Active Sui represented Wh
<=
Canonical Energy Position backing.
```

## API verification

Canonical Copilot APIs:

```text
GET  /api/v1/copilot/registry
POST /api/v1/copilot/plan
POST /api/v1/copilot/run

GET  /api/v1/copilot/actions
POST /api/v1/copilot/actions/:id/approve
POST /api/v1/copilot/actions/:id/reject
POST /api/v1/copilot/actions/:id/wallet-signature
```

Canonical Digital Energy APIs and institutional settlement controls remain integrated under `/api/v1/digital-energy`.

Local Energy OS product APIs:

```text
GET  /api/v1/local-energy/health
GET  /api/v1/local-energy/overview
GET  /api/v1/local-energy/listings
POST /api/v1/local-energy/listings
GET  /api/v1/local-energy/flexibility
POST /api/v1/local-energy/flexibility
```

Local marketplace execution remains under `/api/v1/p2p/*`.

## Validation results

```text
✓ PowerChain Local Energy OS canonical checker
✓ PowerChain Local Energy OS focused tests
✓ @powerchain/local-energy TypeScript typecheck
✓ PowerChain Copilot canonical checker
✓ PowerChain Copilot focused tests
✓ Digital Energy canonical checker
✓ Digital Energy focused tests
✓ Portable tooling smoke suite: 112 / 112
✓ @powerchain/copilot TypeScript typecheck
✓ Touched TS/TSX syntax: 43 files
✓ Routing checker
✓ Prisma schema checker
✓ Migration checker
✓ OpenAPI checker
✓ Documentation checker
✓ Import resolution checker
✓ Monorepo checker
✓ Duplicate-owner checker
✓ Interaction checker
✓ Configuration checker
✓ Repository structure checker
✓ JSON parse: 106 files
✓ YAML parse: 11 files / 12 documents
✓ 64 versioned workspace manifests at 1.0.0
✓ 64 unique workspaces
✓ 10 canonical Prisma migrations
✓ 1,226 source files resolve through the import checker
✓ canonical release-label audit
```


## Commerce, Explorer, Checkout and Tokenization verification

Verified:

- canonical `@powerchain/explorer` v1.0.0 workspace shared by platform and standalone Explorer;
- canonical `@powerchain/tokenization` v1.0.0 workspace;
- organization-scoped Marketplace, Checkout and Tokenization PostgreSQL persistence;
- atomic marketplace inventory reservation with advisory transaction lock and `SELECT ... FOR UPDATE`;
- reservation cancellation/checkout expiry restores unpaid marketplace inventory;
- same idempotency key + changed payload is rejected;
- review-first Checkout lifecycle;
- external wallet signatures only;
- linked marketplace orders become `PAID` only after confirmed Checkout settlement;
- Checkout cancellation releases linked marketplace reservations;
- PET-20 Tokenization creation checks Energy Position backing;
- PET-20 Tokenization confirmation re-checks current backing;
- confirmed Tokenization writes the representation to the canonical Digital Energy representation ledger;
- canonical Solana/Sui Explorer resolution;
- modular Commerce frontend architecture;
- `/api/v1` Marketplace, Checkout, Explorer and Tokenization APIs;
- synchronized OpenAPI and platform public specification;
- zero-dependency `/swagger` reference;
- downloadable `/postman` collection and local environment;
- normative Marketplace, Checkout and PET-20 contract specifications;
- strengthened Marketplace, Escrow/Checkout and Energy Token Anchor invariant primitives;
- obsolete duplicate Marketplace service/card/lib ownership removed.

### Commerce control flow

```text
Marketplace Listing
      ↓
Atomic Inventory Reservation
      ↓
Marketplace Order
      ↓
Checkout Session
      ↓
Human Review
      ↓
External Wallet Authorization
      ↓
Submitted Reference
      ↓
Verified Confirmation
      ↓
Marketplace Order = PAID
```

Checkout never performs custodial signing.

### Tokenization control flow

```text
Verified Energy Position
      ↓
DRAFT
      ↓
REVIEW_REQUIRED
      ↓
APPROVED
      ↓
AWAITING_WALLET
      ↓
SUBMITTED
      ↓
CONFIRMED
      ↓
Canonical Digital Energy representation ledger
```

Before `CONFIRMED`, the implementation re-reads current Energy Position backing and rejects representation that would exceed available canonical Wh.

### Explorer control boundary

```text
chain inclusion
≠ meter evidence
≠ physical delivery
≠ financial reconciliation
```

Explorer references provide provenance and navigation only.

### API tooling

```text
/openapi.yaml
/api/v1/openapi
/swagger
/postman
```

Postman artifacts:

```text
docs/api/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json
docs/api/postman/PowerChain-Local.postman_environment.json
```


## GitHub security and dependency-hardening verification

Verified:

```text
✓ .github/dependabot.yml
✓ .github/SECURITY.md
✓ .github/pull_request_template.md
✓ Security workflow
✓ CodeQL workflow
✓ Dependency Review workflow
✓ least-privilege Actions permissions
✓ persist-credentials: false
✓ frozen-lockfile CI command
✓ Gitleaks history scan
✓ local secret-pattern scanner
✓ dependency-advisory regression gate
✓ pnpm minimumReleaseAge = 1440 minutes
✓ secret-safe .gitignore policy
```

Reported vulnerable exact lock resolutions removed:

```text
deepmerge-ts@7.1.5
image-size@2.0.2
elliptic@6.6.1
postcss@8.4.31
sharp@0.34.5
uuid@8.3.2
uuid@9.0.1
@storybook/nextjs@10.5.10
```

Expected remediated dependency resolutions verified structurally:

```text
postcss@8.5.26
deepmerge-ts@8.0.2
uuid@11.1.1
```

Dependency-chain remediation:

```text
@storybook/nextjs
        ↓ removed

apps/storybook
        ↓
@powerchain/component-catalog
        ↓
Next.js + React
```

This removes the unresolved `image-size` and `elliptic` paths instead of suppressing their advisories.

The optional Next.js `sharp` dependency is removed and local Next image optimization is explicitly disabled:

```text
apps/platform → images.unoptimized = true
apps/docs     → images.unoptimized = true
```

Repository secret scanning found no committed credential matching the high-risk patterns enforced by `packages/tooling/scripts/check-security.mjs`.

The exposed credential supplied outside the artifact was **not** written into the repository, documentation, workflow files, release manifest, or generated archive.

Security commands:

```bash
pnpm security:secrets
pnpm security:dependencies
pnpm security:check
```

## Runtime limitation

The artifact environment provides Node 22 without the installed pnpm workspace dependency tree.

Therefore this validation does not claim completion of:

```text
pnpm install
Prisma client generation
dependency-resolved repository-wide pnpm typecheck
Next.js production build
live database migration
native external provider execution
```

The target repository contract remains:

```text
Node.js 24.19+
pnpm 11.22.0
```

The portable tooling suite excludes only `application-runtime.test.mjs`, which directly imports TypeScript and requires the workspace-installed `tsx` loader. All other portable tooling tests pass.

## Target-environment verification

```bash
corepack enable
corepack use pnpm@11.22.0

pnpm install --frozen-lockfile

pnpm db:generate
pnpm migrations:check

pnpm local-energy:validate
pnpm commerce:validate
pnpm copilot:validate
pnpm digital-energy:validate

pnpm typecheck
pnpm build:platform
```

Apply database migrations with:

```bash
pnpm db:migrate
```
