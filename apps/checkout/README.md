# PowerChain Checkout App

Standalone deterministic checkout lifecycle service, default port `3102`.

The canonical persisted platform implementation is exposed under `/api/v1/checkout/*` and uses `@powerchain/database/commerce`.

This standalone app is useful for domain/service testing and does not claim production persistence.
