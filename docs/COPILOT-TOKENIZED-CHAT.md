# PowerChain Copilot Tokenized Chat — Canonical v1.0.0

PowerChain tokenized chat is a deterministic, non-transferable cryptographic receipt layer for settled Copilot responses. It does **not** mint a chat NFT, security, payment token, or other transferable financial instrument.

## Canonical message unit

```text
1 completed assistant response
= 1 MSG UNIT
= 10,000 PWRC
= 10,000,000,000,000 PWRC base units
= $0.020000 reference value
```

PWRC uses 9 decimal places. The reference USD value is accounting/display metadata for the v1.0.0 chat unit; the cryptographic proof binds the exact raw PWRC debit.

## Settlement lifecycle

```text
Canonical quote
    ↓
SHA-256 quoteHash
    ↓
Persist immutable quote
    ↓
Atomic PWRC reservation
    ↓
Encrypted user message
    ↓
AI generation / approved reads
    ↓
Completed response
    ↓
SHA-256 responseHash
    ↓
Atomic Reserved → Spent
    ↓
Append-only credit ledger
    ↓
Signed receipt + receiptHash
    ↓
Deterministic tokenized proofHash
```

A failed or cancelled response releases its reservation and does not receive a `SETTLED` message unit, receipt, or tokenized proof.

## Proof binding

Each settled proof binds:

```text
quoteHash
  ↓
reservationId
  ↓
responseId + responseHash
  ↓
receiptId + receiptHash
  ↓
messageUnitId
  ↓
10,000 PWRC debit
  ↓
proofHash
```

The canonical proof includes:

```json
{
  "settlementStatus": "SETTLED",
  "transferable": false,
  "mintedAsset": false,
  "financialInstrument": false
}
```

The proof hash is SHA-256 over canonical JSON with recursively sorted object keys. The settlement receipt is separately hashed and authenticated with a server-side HMAC signing key.

## Encrypted chat records

New chat messages are encrypted at rest with AES-256-GCM. Stored records contain ciphertext, nonce, authentication tag, key ID and SHA-256 plaintext hash. Plaintext is returned only through the authenticated chat service boundary.

Required production secrets:

```text
POWERCHAIN_CHAT_ENCRYPTION_KEY_B64
POWERCHAIN_CHAT_RECEIPT_SIGNING_KEY_B64
```

Both values must decode to exactly 32 bytes and must remain server-side.

Repositories upgraded from the earlier plaintext `ai_messages.content` format must run:

```text
pnpm chat:encrypt:migrate
```

Production readiness fails while legacy plaintext chat records remain.

## API

Canonical routes:

```text
GET /api/v1/chat/conversations/:conversationId/credits
GET /api/v1/chat/conversations/:conversationId/messages/:messageId/proof
GET /api/v1/credits/chat/:conversationId
GET /api/v1/chat/credits
```

Compatibility aliases delegate to the same implementation:

```text
/api/v1/capilot/...
/api/v1/capilot-mobile/...
/api/v1/copilot-mobile/...
```

Proof endpoints expose hashes, receipt identifiers, receipt signature verification status and semantic flags. They never expose ciphertext, encryption keys, HMAC signing keys or plaintext through the proof response.

## Credit funding boundary

Confirmed PWRC funding is credited through the internal settlement boundary:

```text
POST /api/v1/internal/copilot-credits/fund
```

The endpoint requires an HMAC service signature and accepts only `asset=PWRC` plus `settlementStatus=SETTLED`. It is intended for Payment Kernel / checkout settlement integration, not browser clients.

## Accounting invariants

- Quote is persisted before reservation.
- Reservation requires sufficient unreserved PWRC capacity.
- A reservation settles or releases exactly once.
- One settled assistant response creates exactly one message unit.
- One settled assistant response debits exactly `10,000,000,000,000` PWRC base units.
- Ledger spend references are unique per reservation.
- Token proof hashes are unique.
- Receipt hashes are unique and independently indexed.
- A replayed idempotency key cannot produce a second settled debit.
- External wallet/token transfer is not performed per chat turn.

## UI semantics

Settled assistant responses display a compact proof card:

```text
Tokenized response proof
SETTLED
10,000 PWRC · 1 MSG UNIT
Receipt rcpt_…
Proof   2f8a…
Non-transferable receipt reference
Not a minted asset or financial instrument
```

The card supports cryptographic verification through the authenticated proof endpoint and remains overflow-safe for long identifiers and hashes.
