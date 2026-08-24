# @powerchain/explorer

Canonical multi-network explorer resolver for PowerChain Digital Energy OS v1.0.0.

Supported networks:

```text
Solana devnet
Solana mainnet-beta
Sui devnet
Sui testnet
Sui mainnet
```

Supported resource classes are network-aware:

```text
Solana → transaction · address · token · program
Sui    → transaction · address · object
```

The package centralizes URL construction and identifier validation so UI, APIs and standalone Explorer do not duplicate network logic.

Explorer references are provenance/navigation aids. They do not prove physical energy generation or delivery.
