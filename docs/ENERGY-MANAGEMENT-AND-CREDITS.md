# PowerChain Energy Management & Copilot Credits v1.0.0

## EMS
`apps/ems` is the standalone Energy Management System service. The Platform `/ems` workspace consumes canonical APIs and never synthesizes energy, meter, device or settlement state.

## Local Energy
Listings use integer Wh and the modes `BUY`, `SELL`, and `RENT`. Reservation uses an idempotency key, listing version and database row lock/CAS so concurrent buyers cannot reserve the same Wh twice. Reservation creates `REVIEW_REQUIRED`; it does not imply physical delivery or settlement.

## Copilot Credits
PWRC reference: **$0.000002/PWRC**. Base message: **$0.020 = 10,000 PWRC**. Real-data message: **$0.015 = 7,500 PWRC**. Credits are reserved before generation and settled after verified completion. Unused reservation capacity is released internally; no per-message Solana refund is required.

USD is the canonical pricing reference. EUR and SOL are presentation conversions. Pyth is preferred for SOL/USD and EUR/USD, Jupiter Price v3 is a SOL/USD fallback, and explicit environment references are the final configured fallback.

## Solana programs
- SPL Token: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- Token-2022: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Associated Token: `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`
- Metaplex Token Metadata: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`
- Metaplex Core: `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`
- Metaplex Bubblegum: `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`
- Pyth Receiver: `rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ`

CCT issuance creates a review-required intent backed by evidence. It never mints directly from Copilot or an external provider.

## Jupiter
`@powerchain/integration` uses the pinned `@jup-ag/api` **6.0.44** package with a verified frozen-lock integrity record. Jupiter Token API v2 powers token discovery, while swap endpoints only return unsigned quotes; PowerChain never signs from the Jupiter adapter.

Canonical developer endpoints include `GET /api/v1/solana/tokens/search`, `POST /api/v1/solana/swap/quote`, `GET /api/v1/solana/programs`, `GET /api/v1/tokens/framework`, and `POST /api/v1/tokens/cct/issuance-intents`.
