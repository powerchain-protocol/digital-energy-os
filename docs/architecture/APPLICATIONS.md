# PowerChain application topology

PowerChain applications are independently startable and share the canonical
`@powerchain/application-runtime` request, health, error, metadata, and HTTP
server boundary. Every service exposes `GET /health/live`, `GET /health/ready`,
and `GET /meta` in addition to its domain routes.

| Application | Default port | Responsibility |
| --- | ---: | --- |
| `platform` | 3000 | Primary Next.js UI and application API routes |
| `docs` | 3001 | Product and engineering documentation |
| `web` | 3100 | Public product entry point |
| `api` | 3101 | Versioned API entry point and service discovery |
| `checkout` | 3102 | Pricing, review, wallet approval, and settlement lifecycle |
| `marketplace` | 3103 | Listings, inventory reservations, orders, and checkout linking |
| `ai-gateway` | 3104 | GridLLM request validation and controlled provider routing |
| `integration-gateway` | 3105 | Provider registry and capability discovery |
| `explorer` | 3106 | Canonical Solana and Sui explorer resolution |
| `websocket-gateway` | 3107 | Channel subscriptions and realtime delivery at `/ws` |
| `workers` | 3108 | Idempotent asynchronous jobs and reconciliation processors |
| `ems` | 3010 | Energy Management System facade for companies, utilities, grid operators, communities and energy partners |

## Commands

```bash
pnpm dev                 # primary platform
pnpm dev:services        # service fleet
pnpm dev:all             # all application workspaces
pnpm build               # build every application
pnpm typecheck           # typecheck every application and shared workspace graph
```

Each service can also run independently:

```bash
pnpm --filter @powerchain/checkout-app dev
pnpm --filter @powerchain/marketplace-app start
pnpm --filter @powerchain/ems-app dev
```

Set `HOST` and `PORT` to override an individual service listener. Cross-service
URLs are listed in `.env.example`; no service accepts private keys or performs
wallet signing.

## Transaction boundaries

- Checkout calculates amounts with integer minor units and stops at wallet
  approval before accepting an externally produced signature.
- Marketplace inventory is reserved before checkout and can be marked paid only
  by the checkout session attached to the order.
- AI requests pass through message-size, model, provider, and cost boundaries.
- Integrations expose capability discovery separately from credentialed provider
  execution.
- Worker jobs require idempotency keys and preserve explicit queue states.

Economic and operational authority is database-backed where a durable lifecycle is required. Local Energy uses integer Wh accounting with serializable transactions and compare-and-set reservations. Energy Network, ERP, CMR, rewards, treasury, vault, Asset Graph, device intents and revenue records use organization-scoped PostgreSQL persistence. Optional integration adapters can report `UNCONFIGURED` without blocking unrelated physical-energy operations. Process-local demo repositories are not authoritative for production economic state.
