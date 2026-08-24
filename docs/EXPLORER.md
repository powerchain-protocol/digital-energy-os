# PowerChain Explorer

Version **1.0.0**

PowerChain Explorer provides one canonical network-aware resolver for Solana and Sui resources.

Product route:

```text
/explorer
```

API:

```text
GET  /api/v1/explorer/networks
POST /api/v1/explorer/resolve
```

Standalone service:

```text
apps/explorer
```

Domain package:

```text
packages/explorer
```

The platform and standalone service both consume `@powerchain/explorer`.

## Authority boundary

```text
chain inclusion
≠ meter evidence
≠ physical delivery
≠ settlement reconciliation
```

Explorer links support traceability and provenance, but they never replace domain evidence.
