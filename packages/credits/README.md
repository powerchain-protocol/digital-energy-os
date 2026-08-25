# PowerChain Copilot Credits v1.0.0

PowerChain Copilot uses a **PWRC-backed internal credit ledger** rather than transferring tokens on-chain for every message.

Canonical pricing policy:

- Base Copilot message: **$0.020**.
- Workspace / real-data message: **$0.015**.
- Reference conversion: **$0.000002 per PWRC** when no approved oracle price is configured.
- At that reference, a base message is **10,000 PWRC** and a real-data message is **7,500 PWRC**.

Flow:

`confirmed PWRC funding -> internal credit balance -> reserve -> generate -> settle actual usage -> release unused reservation`

The ledger is append-only. Chat usage does not create one Solana transaction per turn. A released reservation is not a refund or journal reversal; it is unused held capacity becoming available again. SOL equivalents are informational only and are emitted only when an observed/configured SOL/USD price is available.
