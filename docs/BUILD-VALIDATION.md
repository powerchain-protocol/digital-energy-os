# PowerChain v1.0.0 build validation

This document records the canonical v1.0.0 static release validation completed on 2026-08-29. It separates repository/package verification from dependency-resolved deployment certification.

## Canonical target

- PowerChain version: `1.0.0`
- Package manager: `pnpm@11.22.0`
- Node engine: `>=24.19.0 <27`
- Next.js: lock-compatible `16.2.12`
- Canonical Energy unit: integer `Wh`
- Public API namespace: `/api/v1`
- Tokenized Copilot unit: `1 MSG UNIT = 10,000 PWRC = 10,000,000,000,000 base units`
- Tokenized Copilot reference value: `$0.020000` per settled response

## Completed in the packaging runtime

The static release suite completed successfully with:

- `72 / 72` tooling regression tests passing.
- `68` unique workspaces, all fixed at PowerChain version `1.0.0`.
- `1,156` source-file import-resolution checks passing.
- `1,058` TypeScript/TSX implementation files syntax-transpiled with TypeScript 5.8.3 and no syntax diagnostics; declaration files were excluded from transpile-only output generation.
- `6` canonical Prisma migrations structurally validated.
- OpenAPI, Swagger and Postman canonical operations validated.
- routing, interactions, environment declarations, schema, program, contract, architecture, PTSP, Engineering Framework, documentation, duplicate ownership, Local Energy and release-verification checks passing.
- formatting hygiene and Tailwind 4/PostCSS configuration checks passing.
- repository JSON and OpenAPI/Postman JSON parsed successfully, and both OpenAPI YAML documents parsed successfully.

## Tokenized chat / PWRC credit validation

The v1.0.0 tokenized-chat path is validated as a deterministic accounting and receipt system rather than a transferable token system.

```text
Canonical quote
    ↓
SHA-256 quote hash
    ↓
Persist quote
    ↓
Atomic 10,000 PWRC reservation
    ↓
AI + approved read tools
    ↓
Completed assistant response
    ↓
Response hash
    ↓
Atomic Reserved → Spent
    ↓
Append-only credit ledger
    ↓
Authenticated receipt
    ↓
Deterministic tokenized response proof
```

The database and tests enforce:

- exactly one message unit for a settled assistant response;
- exactly `10,000,000,000,000` PWRC base units per settled message unit;
- quote, reservation, response, receipt, message-unit and proof lineage;
- unique token-proof hash and receipt/reservation lookup indexes;
- no settled proof for failed or cancelled responses;
- atomic reservation release on failure/cancellation;
- append-only `FUND`, `RESERVE`, `RELEASE` and `SPEND` credit-ledger entries;
- deterministic proof hashes;
- `SETTLED` proof semantics with `transferable=false`, `mintedAsset=false`, and `financialInstrument=false`;
- AES-256-GCM encrypted message writes with plaintext SHA-256 hashing before encryption;
- authenticated receipt signatures;
- proof APIs exposing hashes and receipt metadata, not encryption keys, nonces, auth tags or plaintext storage material;
- compatibility API aliases delegating to the same canonical handlers rather than maintaining parallel state.

Production readiness intentionally fails closed unless PostgreSQL, `POWERCHAIN_CHAT_ENCRYPTION_KEY_B64`, and `POWERCHAIN_CHAT_RECEIPT_SIGNING_KEY_B64` are configured and legacy plaintext chat rows have been migrated with `pnpm chat:encrypt:migrate`.

## Toolchain-dependent validation not claimed

The packaging runtime currently exposes Node `22.16.0`, while the repository requires Node `>=24.19.0 <27`. The repository also has no installed dependency tree in this artifact runtime, and external registry installation is not available here.

Therefore this package does **not** claim that the following dependency-resolved/toolchain-dependent operations were executed in this environment:

- `pnpm install --frozen-lockfile` against the package registry;
- full Next.js/React application typecheck or production builds;
- Prisma CLI validation/generation against installed Prisma binaries;
- Anchor/Rust builds;
- Sui Move builds;
- live database migration execution;
- live Solana/Sui/provider settlement integration tests.

The lockfile importer graph was checked structurally against every workspace manifest without inventing registry resolutions.

## Deployment-environment certification

Run the following with the declared target Node and package-manager versions:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --frozen-lockfile
pnpm prisma:validate
pnpm prisma:generate
pnpm chat:encrypt:migrate
pnpm local-energy:doctor
pnpm local-energy:verify
pnpm chat:proof:test
pnpm typecheck
pnpm build:apps
pnpm release:verify
```

Before enabling production Copilot chat, confirm `/api/v1/ready` reports the tokenized-chat subsystem `READY`. Where blockchain deployments are enabled, additionally run the repository's Anchor/Rust and Sui Move build/deployment validation with audited program/package IDs and real deployment authorities.

## Release rule

A green static package verification is not equivalent to mainnet deployment certification. Physical Energy evidence remains authoritative, provider credentials remain server-side, consequential actions remain approval/wallet gated, and any placeholder/deployment-blocking on-chain configuration must be replaced with audited production data before deployment.
