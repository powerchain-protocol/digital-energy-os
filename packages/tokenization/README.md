# @powerchain/tokenization

Review-first PET-20 tokenization contracts for verified Energy Positions.

Canonical lifecycle:

```text
DRAFT
→ REVIEW_REQUIRED
→ APPROVED
→ AWAITING_WALLET
→ SUBMITTED
→ CONFIRMED
```

Key invariant:

```text
Active Solana Wh
+ Active Sui Wh
<= Canonical Energy Position backing
```

Confirmation re-checks current Energy Position availability before the chain representation is written to the canonical Digital Energy representation ledger.

PowerChain never silently signs a wallet transaction.
