# @powerchain/marketplace

Marketplace listing/order domain logic.

Production persistence and concurrency-safe inventory reservation are provided by `@powerchain/database/commerce`.

Canonical platform flow:

```text
Listing → Atomic reservation → Checkout link → Checkout confirmed → Order PAID
```
