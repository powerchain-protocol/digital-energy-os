# PowerChain API v1.0.0

The public API is namespaced under `/api/v1`. Compatibility routes under `/api/*` delegate to the same canonical services and do not maintain a second data model.

## Platform

```text
GET /api/v1/health
GET /api/v1/ready
GET /api/v1/config/public
GET /api/v1/me
```

`/health` is liveness. `/ready` is deployment readiness and returns HTTP 503 when a required production dependency is unavailable. `/config/public` contains browser-safe configuration only. `/me` requires the authenticated session cookie.

## Projects and programs

```text
GET /api/v1/projects
GET /api/v1/projects/:slug
GET /api/v1/programs
GET /api/v1/powerchain/overview
GET /api/v1/powerchain/programs
GET /api/v1/token/allocations
```

PWRC allocation percentages are read from `POWERCHAIN_PWRC_ALLOCATIONS_JSON`. If the governance-approved allocation policy is not configured, the API returns `UNCONFIGURED` instead of inventing tokenomics.

## Solana

```text
GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint
```

`/api/v1/solana/market` requires an explicit `mint`. The compatibility `/api/token/market` alias may default to configured `PWRC_MINT`/`POWERCHAIN_PWRC_MINT`. Solana overview includes RPC health, version, slot, block height, epoch, latest blockhash, and genesis hash. Program routes verify configured PowerChain/Launchpad program accounts on-chain. Asset inspection distinguishes SPL Token from Token-2022 and reports supply, decimals, authorities, and parsed extensions. Market resolution uses Pyth, CoinGecko, CoinMarketCap, then the optional Birdeye compatibility fallback.

Compatibility aliases:

```text
GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

## Developer platform

```text
GET /api/swagger/
GET /api/v1/openapi.json
GET /api/v1/openapi.yaml
GET /api/postman
```

The source OpenAPI document is `docs/api/swagger.yaml`. The public copies under `apps/platform/public/` are generated from that source. The Postman collection is `docs/api/postman/PowerChain-v1.0.0.postman_collection.json`.

## Authority boundaries

API market, blockchain, payment, and settlement observations never replace physical meter/DER/grid evidence. Financial and token operations remain subject to the PowerChain control plane, policy, explicit approval, and external/scoped signing authority.

## Next.js website-origin proxy

The canonical and compatibility Solana routes are Next.js server route handlers over the same `powerchain-api` service functions. Provider credentials and custom RPC URLs remain server-side. See [`NEXTJS-SOLANA-PROXIES.md`](./NEXTJS-SOLANA-PROXIES.md).

## Tokenized Copilot chat and PWRC credits

```text
GET  /api/v1/chat
POST /api/v1/chat
GET  /api/v1/chat/credits
GET  /api/v1/chat/conversations/:conversationId/credits
GET  /api/v1/chat/conversations/:conversationId/messages/:messageId/proof
GET  /api/v1/credits/chat/:conversationId
```

`POST /api/v1/chat` requires an authenticated session plus `Idempotency-Key`. The canonical settlement invariant is **1 completed assistant response = 1 MSG UNIT = 10,000 PWRC = 10,000,000,000,000 base units**. The server persists the quote hash before reservation, encrypts chat content at rest with AES-256-GCM, atomically moves reserved credits to spent only after successful response delivery, appends the credit ledger, signs the receipt, and stores a deterministic proof hash.

Proof responses contain hash/receipt metadata and verification flags only. They do not expose plaintext encryption material, encryption keys, or receipt signing keys. Proof semantics are always `SETTLED`, `transferable=false`, `mintedAsset=false`, and `financialInstrument=false`.

Compatibility aliases under `/api/v1/capilot`, `/api/v1/capilot-mobile`, and `/api/v1/copilot-mobile` re-export the same canonical credit-summary and proof handlers; they do not maintain separate accounting state.
