# PowerChain Token Framework v1.0.0

`@powerchain/token-framework` centralizes token standards, network program identifiers, evidence-backed issuance intents and token metadata.

## Solana standards

PowerChain supports SPL Token and Token-2022. Metaplex identifiers are explicitly catalogued for Token Metadata, MPL Core and compressed-asset infrastructure. Pyth and Jupiter program identifiers are exposed as reference constants and are not treated as wallet authority.

## CCT

PowerChain Carbon Credit Token (`CCT`) is defined as a Token-2022 asset. Deployment remains `CONFIG_REQUIRED` until a canonical mint is configured. Issuance requires verified carbon evidence and creates an approval-controlled intent; the API never silently signs or mints.

## Jupiter

Jupiter integration is read/prepare-only in PowerChain. Token discovery uses Tokens V2, pricing uses Price V3, and swap quote generation is isolated behind `@powerchain/integration`. A quote is not a signed transaction.
