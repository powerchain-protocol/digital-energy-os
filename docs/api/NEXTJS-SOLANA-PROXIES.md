# Solana and PowerChain website-origin proxies — v1.0.0

The Next.js platform exposes the canonical Solana/PowerChain read API on the same website origin. Browser clients call these routes and never receive Helius API keys, custom RPC URLs, CoinGecko/CoinMarketCap credentials, or Pyth provider configuration.

## Canonical routes

```text
GET /api/v1/powerchain/overview
GET /api/v1/powerchain/programs
GET /api/v1/solana/overview
GET /api/v1/solana/programs
GET /api/v1/solana/market?mint=<address>
GET /api/v1/solana/assets/:mint
```

`/api/v1/solana/market` **always requires an explicit `mint`**. It never silently substitutes PWRC.

## Compatibility aliases

```text
GET /api/solana/overview
GET /api/token/market?mint=<address>
GET /api/assets/:mint
```

These are aliases over the same server functions, not separate implementations. `/api/token/market` may default to `PWRC_MINT`, then `POWERCHAIN_PWRC_MINT`, then the legacy public mint configuration when `mint` is omitted.

## Solana overview

The overview reads the configured RPC and exposes only non-secret state:

- `getHealth`
- `getVersion`
- `getSlot`
- `getBlockHeight`
- `getEpochInfo`
- `getLatestBlockhash`
- `getGenesisHash`

The response identifies only the RPC source class (`custom`, `helius-url`, `helius-key`, or `public`), never the URL or API key.

## Program verification

PowerChain and Launchpad program bindings are configured by environment. The API validates each public key and then queries `getAccountInfo` to distinguish:

- `NOT_CONFIGURED`
- `INVALID_PROGRAM_ID`
- `ACCOUNT_NOT_FOUND`
- `NOT_EXECUTABLE`
- `DEPLOYED`
- `RPC_UNAVAILABLE`

A configured address is therefore not presented as deployed until the account exists and is executable.

## Mint inspection

`/api/v1/solana/assets/:mint` combines Solana RPC with optional Helius DAS and reports:

- owning token program;
- SPL Token vs Token-2022 classification;
- mint/account parsed type;
- raw supply and decimals;
- mint authority;
- freeze authority;
- Token-2022 parsed extensions where the RPC exposes them;
- Helius DAS metadata when configured.

Helius/DAS is supplemental. Solana RPC remains the source for token-program ownership and supply.

## Market resolution

The server resolves token market data without exposing credentials. The deterministic price precedence is:

1. Pyth Hermes when the mint has an explicit `POWERCHAIN_PYTH_FEED_MAP_JSON` mapping;
2. CoinGecko token-by-contract resolution for Solana;
3. CoinMarketCap DEX token-price resolution for Solana;
4. Birdeye compatibility fallback when configured.

Liquidity, volume, 24-hour change, and market cap are filled from the first sourced provider that exposes the field. No value is invented when providers have no result.
