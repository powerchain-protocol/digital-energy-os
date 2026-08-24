# @powerchain/checkout

Deterministic checkout state and pricing logic.

Production persistence is provided by `@powerchain/database/commerce`.

Canonical lifecycle:

```text
CREATED → REVIEW → PENDING_SIGNATURE → SUBMITTED → CONFIRMED
```

The wallet signature is external.
