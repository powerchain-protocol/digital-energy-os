# @powerchain/programs

Canonical on-chain boundary for Solana/Anchor and Sui program metadata. The production Rust crate, Anchor networks, domain modules, toolchain, tests, and isolated Cargo target live under `anchor`.


## Commerce and tokenization invariants

The v1.0.0 program layer now exposes deterministic primitives for the same boundaries enforced by the application services.

### Marketplace

```text
remaining <= inventory
reservation quantity > 0
reservation quantity <= remaining
checked order multiplication
cancel/release cannot restore above original inventory
```

Contract: `PCC-MKT-001`

### Checkout / Escrow

```text
CREATED
→ REVIEW
→ PENDING_SIGNATURE
→ SUBMITTED
→ CONFIRMED
```

Direct review-to-confirmed transitions are invalid.

External wallet references are required; programs do not sign for users.

Contract: `PCC-CHK-001`

### PET-20 Energy Tokenization

```text
reserved Wh
+ active Solana Wh
+ active Sui Wh
+ retired Wh
<= canonical Energy Position Wh
```

Contract: `PCC-TOK-001`

These primitives are validation logic and test targets. Mainnet deployment still requires published program IDs, audit, upgrade-authority review, and deployment-specific configuration.
