# PowerChain Digital Energy OS v1.0.0 — Build Validation

## Canonical release identity
- Product version: **1.0.0**
- PowerChain package manifests: **81**, all version 1.0.0
- Package manager target: **pnpm 11.22.0**
- Node engine: **>=24.19.0 <27**
- Next.js compatibility line: **16.2.12**

## Passed in this artifact environment
- Frozen-lock importer/specifier synchronization: passed for 81 root/workspace manifests.
- Canonical structural validation: **18/18**.
- Import resolution: **1,238 source files**.
- Prisma schema static validation: passed.
- Canonical Prisma migration validation: **9 migrations**.
- OpenAPI structure: passed.
- Developer API artifact coverage: **20 required methods**, including EMS, ERP, CMR, Rewards, Treasury, Vault, Local Energy, Credits, Jupiter, Token Framework, CCT, Asset Graph, Control Plane and Revenue.
- Portable tooling tests: **55/55 passed**.
- TypeScript/TSX syntax transpilation: **1,138 files, 0 syntax failures**.
- JSON parse: **118 files**.
- YAML parse: **7 files**.
- Duplicate ownership: passed.
- All PowerChain package versions: 1.0.0.

## Dependency / lockfile note
`@jup-ag/api` is pinned to **6.0.44** in this artifact because an independently verifiable package integrity hash was available for that exact release, allowing the frozen lockfile to remain deterministic without inventing a dependency resolution. The adapter remains isolated behind `@powerchain/integration`.

## Environment limitations
This artifact runtime is Node **22.16.0**, has Corepack but no installed pnpm workspace dependency tree. A dependency-resolved `tsc` run therefore stops at missing `node`, `react`, and `react-dom` type definitions. The same limitation prevents a truthful claim that `pnpm install --frozen-lockfile`, Prisma Client generation, Next.js production builds, Storybook build, or live PostgreSQL migrations were executed here.

Run the final target-environment certification with:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm db:generate
pnpm migrations:check
pnpm validate:canonical
pnpm test
pnpm typecheck
pnpm build
pnpm build-storybook
pnpm release:verify
```

`release:verify` also requires `pnpm-lock.yaml` to be committed when executed from a Git checkout.
