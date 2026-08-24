# PowerChain Security

PowerChain Digital Energy OS **v1.0.0** separates software supply-chain security, tenant authorization, wallet authorization, physical-energy evidence, financial settlement, and blockchain state.

Canonical repository policy lives in:

```text
.github/SECURITY.md
```

This document describes the implementation controls used by the monorepo.

## Security boundaries

### Credentials

Secrets are never application configuration defaults.

```text
Repository
    ✗ OAuth/PAT tokens
    ✗ API keys
    ✗ database passwords
    ✗ private keys
    ✗ seed phrases
    ✗ service-account credentials

Secret manager / GitHub Actions secrets
    ✓ runtime credentials
```

`.env.example` documents variable names only. Local `.env` files and common credential/private-key formats are ignored by Git.

If a credential is exposed, treat it as compromised even when GitHub reports its validity as unknown:

```text
rotate dependencies on credential
→ revoke credential at provider
→ review security/audit logs
→ replace workflow integration with managed secret
→ verify secret scanning is clean
→ close alert as revoked
```

Never copy the exposed value into a remediation commit, issue, README, CI log, or incident document.

## GitHub repository controls

Committed under `.github/`:

```text
dependabot.yml
SECURITY.md
pull_request_template.md
workflows/
├── security.yml
├── codeql.yml
└── dependency-review.yml
```

Controls include:

- weekly Dependabot checks for pnpm/npm, GitHub Actions, and Docker;
- GitHub Dependency Review on pull requests, failing at Moderate or higher;
- CodeQL JavaScript/TypeScript analysis;
- Gitleaks full-history scanning;
- least-privilege GitHub Actions permissions;
- `persist-credentials: false` on repository checkout;
- frozen-lockfile CI installation;
- production dependency audit;
- local secret-pattern scanning;
- dependency-advisory regression checks.

Run locally:

```bash
pnpm security:check
```

## pnpm supply-chain policy

`pnpm-workspace.yaml` owns the canonical dependency-resolution policy.

```yaml
minimumReleaseAge: 1440
```

Newly published dependency versions therefore have a release-age buffer before normal resolution.

Security overrides are narrowly scoped to vulnerable transitive paths rather than globally replacing unrelated packages.

The current remediation policy includes:

```text
Next.js → patched PostCSS
Next.js → remove optional sharp
Prisma config → patched deepmerge-ts
jayson → patched uuid
Cetus SDK → patched uuid
```

Because `sharp` is deliberately removed, local Next.js image optimization is disabled in the platform/docs configuration.

## Component catalog

The previous Next-specific Storybook framework pulled unresolved vulnerable transitive parser/browser-crypto dependency chains.

The workspace at:

```text
apps/storybook
```

is retained as a developer UI-reference surface but is now a first-party Next.js **PowerChain Component Catalog** without the vulnerable Storybook Next.js framework chain.

Root compatibility commands remain:

```bash
pnpm storybook
pnpm build-storybook
```

## Wallet authorization

PowerChain agents and application services may prepare transaction intents, but wallet authority remains external.

```text
Intent
→ Policy
→ Evidence
→ Simulation
→ Human approval
→ External wallet signature
→ Verification
```

PowerChain must never request or store wallet recovery phrases or private keys.

## Physical-energy authority

Blockchain inclusion does not supersede physical evidence:

```text
transaction confirmation
≠ meter evidence
≠ physical energy delivery
≠ reconciliation
≠ financial settlement
```

Telemetry and meter evidence remain authoritative for physical-energy state.

## Tenant isolation

LIVE economic data is organization scoped.

Sensitive writes must preserve:

```text
authenticated tenant identity
+ authorization policy
+ idempotency
+ authoritative evidence
+ audit/provenance
```

Untrusted request headers cannot silently become LIVE tenant authority.

## Local verification

```bash
pnpm security:secrets
pnpm security:dependencies
pnpm security:check
```

The local secret scanner intentionally checks repository text for common high-risk token/private-key patterns without printing secret contents.

## Deployment verification

The generated artifact is structurally validated, but the final deployment environment must run dependency resolution against the registry and GitHub's security services:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --frozen-lockfile

pnpm security:check
pnpm audit --prod --audit-level=moderate
pnpm validate
pnpm typecheck
pnpm build
```

GitHub should additionally report:

```text
Secret scanning       clean
Dependabot             no unresolved applicable vulnerable resolution
CodeQL                 clean / reviewed
Dependency Review      passing
```
