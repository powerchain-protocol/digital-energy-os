# PowerChain Energy Network v1.0.0

The Energy Network is the tenant-aware directory and relationship layer for consumers, prosumers, retailers, renewable generators, grid operators, utilities, communities, aggregators, energy companies, service providers and partners.

Search is exposed through `GET /api/v1/energy-network/search`. Public/provider profiles are intentionally separate from privileged organization data.

Local Energy supports BUY, SELL and RENT listings using integer Wh. Reservation is compare-and-set against available quantity and listing version. `REVIEW_REQUIRED`, `RESERVED`, `DELIVERING`, `DELIVERED`, `RECONCILED`, `SETTLEMENT_READY`, and `SETTLED` remain distinct lifecycle states.
