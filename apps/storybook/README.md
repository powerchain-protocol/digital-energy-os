# PowerChain Component Catalog

The former `@storybook/nextjs` development surface was replaced by this first-party Next.js component catalog.

Reason: the Next-specific Storybook framework pulled transitive `image-size` and browser crypto polyfill dependencies with unresolved security advisories. The catalog keeps the same `apps/storybook` workspace location and port `6006` while removing those dependency chains.

```bash
pnpm storybook
pnpm build-storybook
```

This workspace is intentionally small. Canonical reusable UI remains owned by `packages/ui` and `packages/shared`.
