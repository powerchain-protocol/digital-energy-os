# PowerChain Copilot Credits v1.0.0

PowerChain Copilot uses an internal PWRC-backed credit ledger rather than creating a Solana transaction for every model response.

## Canonical pricing

| Class | USD | PWRC reference | PWRC charge |
| --- | ---: | ---: | ---: |
| Base | $0.020 | $0.000002 / PWRC | 10,000 PWRC |
| Real Data | $0.015 | $0.000002 / PWRC | 7,500 PWRC |

`REAL_DATA` is used only when the request consumes authenticated PowerChain operational data. USD is the accounting reference for message pricing. EUR and SOL are display conversions and are never used as fabricated accounting truth.

## Pricing sources

`@powerchain/credits` resolves rates in this order:

- SOL/USD: Pyth Hermes → Jupiter Price V3 → explicitly configured reference.
- EUR/USD: configured Pyth feed or Pyth feed discovery → explicitly configured reference.
- PWRC/USD: canonical PowerChain policy reference unless a governed pricing source is explicitly supplied.

When a sourced conversion is unavailable, the corresponding EUR or SOL display value is omitted rather than guessed.

## Accounting lifecycle

```text
Confirmed PWRC funding
        ↓
Credit account
        ↓
Immutable credit ledger
        ↓
RESERVE before generation
        ↓
Context → Generate → Verify
        ↓
SETTLE actual charge
        ↓
RELEASE unused reservation
```

A reservation is not a debit. Cancellation/failure releases unused capacity. A confirmed funding reference is unique and cannot credit the same account twice.

## API

- `GET /api/v1/copilot/credits`
- `GET /api/v1/copilot/credits/rates`
- `POST /api/v1/copilot/credits/quote`

The quote endpoint accepts `USD`, `EUR`, `SOL`, or `PWRC` as the display currency. Monetary conversions remain sourced and timestamped.
