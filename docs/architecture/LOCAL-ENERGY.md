# Local Energy v1.0.0

PowerChain supports BUY, SELL and RENT. Persistent listing quantity and availability are integer Wh. Reservation is serializable and compare-and-set against `version` and `available_wh`.

Lifecycle: REVIEW_REQUIRED → RESERVED → DELIVERING → DELIVERED → RECONCILED → SETTLEMENT_READY → SETTLED. Typed dispute/cancellation states remain separate.
