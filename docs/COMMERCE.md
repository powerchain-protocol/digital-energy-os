# PowerChain Commerce Architecture

Version **1.0.0**

PowerChain Commerce combines Marketplace, Checkout and Tokenization without collapsing their authority boundaries.

```text
DISCOVERY
Marketplace listing
      ↓
ATOMIC RESERVATION
Marketplace order
      ↓
CHECKOUT
Review exact economics
      ↓
EXTERNAL WALLET
User signs
      ↓
VERIFICATION
Checkout confirmation
      ↓
ORDER RECONCILIATION
Marketplace order → PAID
```

## Marketplace

Canonical routes:

```text
/marketplace

GET  /api/v1/marketplace/listings
POST /api/v1/marketplace/listings
POST /api/v1/marketplace/listings/:id/activate

POST /api/v1/marketplace/orders
GET  /api/v1/marketplace/orders/:id
POST /api/v1/marketplace/orders/:id/checkout
```

Inventory reservation is serialized:

```text
BEGIN
→ advisory transaction lock
→ listing SELECT ... FOR UPDATE
→ idempotency validation
→ quantity validation
→ order insert
→ inventory decrement
→ COMMIT
```

This prevents concurrent oversubscription.

## Checkout

Canonical route:

```text
/checkout
```

Lifecycle:

```text
CREATED
→ REVIEW
→ PENDING_SIGNATURE
→ SUBMITTED
→ CONFIRMED
```

Alternative terminal states:

```text
CANCELLED
EXPIRED
```

The checkout server never creates a user wallet signature.

`SUBMITTED` records a reference created externally by the user wallet.

`CONFIRMED` verifies that the reference matches the submitted settlement record.

A linked marketplace order is moved to `PAID` only after checkout confirmation.

## Idempotency

Economic POST operations require:

```text
Idempotency-Key
```

Same key + same request:

```text
safe retry
```

Same key + different request:

```text
*_IDEMPOTENCY_CONFLICT
```

## Persistence

Canonical tables:

```text
marketplace_listings
marketplace_orders
checkout_sessions
```

These are organization scoped.

When `DATABASE_URL` is configured, economic operations fail closed if the database is unavailable.

## Modular frontend

Commerce UI is organized under:

```text
apps/platform/src/features/commerce/
├── actions/
├── config.ts
├── constants.ts
├── context/
├── hooks/
├── services/
├── types.ts
└── utils.ts
```

Shared domain logic remains in packages rather than UI components.
