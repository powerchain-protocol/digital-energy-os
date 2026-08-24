# Dependency Hardening

**Product:** PowerChain Digital Energy OS  
**Version:** 1.0.0  
**Package manager:** pnpm 11.22.0

This document records the repository-level remediation applied for the dependency findings surfaced by GitHub Dependabot.

It intentionally does **not** reproduce any exposed credential.

## Remediation matrix

| Finding | Previous resolved path | Canonical remediation |
| --- | --- | --- |
| `image-size` ICNS infinite-loop DoS | Next-specific Storybook framework chain | Removed the framework dependency chain and replaced it with the first-party PowerChain Component Catalog |
| `image-size` JXL/HEIF infinite-loop DoS | Next-specific Storybook framework chain | Same dependency-chain removal; `image-size` is absent from the lock graph |
| `deepmerge-ts` recursive graph stack exhaustion | `@prisma/config` transitive dependency | Scoped pnpm override to `deepmerge-ts 8.0.2` |
| PostCSS arbitrary source-map file read | Next.js transitive PostCSS | Scoped override to `postcss 8.5.26` |
| PostCSS previous source-map traversal | Next.js transitive PostCSS | Scoped override to `postcss 8.5.26` |
| PostCSS incomplete source-map fix | Next.js transitive PostCSS | Scoped override to `postcss 8.5.26` |
| PostCSS `</style>` stringify XSS | Next.js transitive PostCSS | Scoped override to `postcss 8.5.26` |
| `sharp` inherited libvips vulnerabilities | Next.js optional image optimizer | Removed optional `sharp`; Next image optimization set to `unoptimized` |
| `uuid` buffer bounds issue | `jayson` / Solana dependency path | Scoped override to `uuid 11.1.1` |
| `uuid` buffer bounds issue | Cetus SDK dependency path | Scoped override to `uuid 11.1.1` |
| `elliptic` risky cryptographic primitive | Storybook Next.js browser-polyfill chain | Removed dependency chain; `elliptic` is absent from the lock graph |

## Lockfile policy

The lock graph was pruned after the Storybook dependency replacement so stale vulnerable packages do not remain as unused lock records.

Regression checks reject the exact vulnerable entries that triggered the supplied findings:

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

Expected remediated resolutions include:

```text
postcss@8.5.26
deepmerge-ts@8.0.2
uuid@11.1.1
```

Run:

```bash
pnpm security:dependencies
```

## Why dependency-chain removal was used

Some reported packages had no patched release suitable for the affected dependency chain.

Where a vulnerable package was only present through non-essential developer tooling, PowerChain removes that chain instead of suppressing the advisory.

This is preferable to:

```text
ignore advisory
or
retain vulnerable parser/crypto package
or
claim a false patched version
```

## Next.js image policy

The optional `sharp` dependency is removed from the Next.js dependency path.

Therefore:

```text
apps/platform → images.unoptimized = true
apps/docs     → images.unoptimized = true
```

This is explicit and intentional. Re-enabling optimized local image processing requires introducing a verified non-vulnerable image-processing implementation and regenerating the lockfile normally.

## Component catalog migration

Before:

```text
apps/storybook
→ @storybook/nextjs
→ image parsing / browser-polyfill transitive dependency chains
```

After:

```text
apps/storybook
→ @powerchain/component-catalog
→ Next.js + React
```

The workspace and familiar root scripts are retained, while the vulnerable framework-specific dependency paths are removed.

## Registry verification requirement

The artifact environment could not perform a fresh registry-backed `pnpm install --frozen-lockfile` because outbound package-registry resolution was unavailable during the build.

The target repository must therefore run:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --frozen-lockfile
pnpm security:check
pnpm audit --prod --audit-level=moderate
```

Do not close Dependabot alerts solely from this document. Confirm the updated commit is indexed by GitHub and that the corresponding alerts are resolved or no longer applicable.
