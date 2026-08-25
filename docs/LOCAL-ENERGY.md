# PowerChain Local Energy v1.0.0

Local Energy is an evidence-first physical-energy market supporting BUY, SELL and RENT.

Canonical accounting uses integer Wh:

- 1 kWh = 1,000 Wh
- 1 MWh = 1,000,000 Wh

## Reservation rule

```text
Listing version + available Wh
            ↓
SERIALIZABLE transaction
            ↓
compare-and-set
            ↓
REVIEW_REQUIRED reservation
```

Reservation does not mean delivery. Delivery does not mean reconciliation. Reconciliation does not mean settlement-ready. Financial settlement cannot create or replace meter/DER/grid evidence.
