# PowerChain PET-20 Tokenization

Version **1.0.0**

Tokenization is an optional representation layer above verified Energy Positions.

```text
Verified Energy Position
       ↓
Tokenization Draft
       ↓
Human Review
       ↓
Human Approval
       ↓
External Wallet Signature
       ↓
Chain Submission
       ↓
Confirmation
       ↓
Canonical Digital Energy representation ledger
```

## API

```text
GET  /api/v1/tokenization/intents
POST /api/v1/tokenization/intents

POST /api/v1/tokenization/intents/:id/review
POST /api/v1/tokenization/intents/:id/approve
POST /api/v1/tokenization/intents/:id/wallet
POST /api/v1/tokenization/intents/:id/submit
POST /api/v1/tokenization/intents/:id/confirm
POST /api/v1/tokenization/intents/:id/cancel
```

## Invariants

```text
physical energy remains authoritative
tokenization is optional
requested Wh <= currently available backing
cross-chain active Wh <= canonical Energy Position backing
confirmation re-checks backing
wallet signature remains external
```

The confirmation step writes the representation to the Digital Energy ledger using a deterministic representation ID derived from the tokenization intent.

## Contracts / programs

Normative contract:

```text
PCC-TOK-001
```

Anchor primitive:

```text
packages/programs/anchor/energy-token/src/lib.rs
```

This program logic is not a statement of mainnet deployment. Mainnet use still requires audited deployed program IDs and network configuration.
