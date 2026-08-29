# PowerChain Digital Energy Infrastructure

**PowerChain Local Energy OS · Copilot Integrated · Canonical v1.0.0**

Local Energy · Energy Management · Smart Metering · Energy RWA · Solana · Sui · DePIN · AI Control Plane

## Executive summary

PowerChain is an AI-native operating and settlement platform for renewable infrastructure, tokenized real-world assets, connected energy systems and policy-governed economic workflows.

The platform preserves one non-negotiable boundary:

> Physical energy remains authoritative. Digital assets, AI, blockchain settlement and financial records may coordinate around physical energy, but they cannot manufacture or replace physical evidence.

The canonical operating sequence is:

```text
OBSERVE
  ↓
MEASURE
  ↓
VERIFY
  ↓
UNDERSTAND
  ↓
RECOMMEND
  ↓
PREPARE
  ↓
REVIEW
  ↓
APPROVE
  ↓
EXECUTE
  ↓
RECONCILE
  ↓
AUDIT
```

## 1. PowerChain Control Plane

Every consequential action passes through a common control boundary:

```text
IDENTITY · TENANT · CONTEXT · POLICY · PERMISSION · APPROVAL · AUDIT
                               ↓
                        ACTION INTENT
                               ↓
                      EXECUTION GATEWAY
                     /        |        \
                 SOLANA      SUI    EXTERNAL APIs
```

Agents can read, analyze and prepare. High-impact execution remains constrained by policy, approval and external signing authority.

## 2. Energy Management System

The first-class PowerChain EMS supports companies, partnerships, electricity retailers, energy companies, utilities, grid operators and communities.

Canonical EMS modules include energy monitoring, smart metering, connected devices, local energy, billing, settlement, forecasting, renewables, rewards and treasury operations.

The standalone `apps/ems/` application consumes the same canonical `/api/v1` resources as the platform. It does not create a second ledger.

## 3. Local Energy

PowerChain Local Energy supports BUY, SELL and RENT workflows. Canonical accounting uses integer watt-hours.

```text
PHYSICAL ENERGY
      ↓
Meter / DER / Grid Evidence
      ↓
LOCAL ENERGY LISTING
      ↓
Atomic Wh Reservation
      ↓
REVIEW_REQUIRED
      ↓
RESERVED
      ↓
DELIVERING
      ↓
Meter Evidence
      ↓
DELIVERED
      ↓
RECONCILED
      ↓
SETTLEMENT_READY
      ↓
External Financial Settlement
      ↓
SETTLED
```

`RESERVED ≠ DELIVERED`, `DELIVERED ≠ RECONCILED`, `RECONCILED ≠ SETTLEMENT_READY`, and `SETTLEMENT_READY ≠ SETTLED`.

Reservations use listing-version compare-and-set semantics inside serializable database transactions. Financial settlement can never create or replace physical delivery evidence.

## 4. Energy Network

The Energy Network directory supports consumers, prosumers, retailers, renewable generators, grid operators, utilities, communities, aggregators, energy companies, service providers and partners.

Search results are backed by persisted public or tenant-scoped participant records. PowerChain does not synthesize providers when no directory data exists.

## 5. Asset Graph

The Asset Graph connects organizations, portfolios, renewable assets, devices, meters, Energy Positions, tokens, evidence, treasury accounts and settlements using explicit relationships such as `OWNS`, `MONITORS`, `GENERATES`, `BACKS`, `VERIFIED_BY`, `TOKENIZED_AS` and `SETTLES`.

External provider output reaches the Asset Graph through evidence and verification, not direct writes.

## 6. Device Control

AI cannot issue arbitrary commands to connected infrastructure.

```text
AI recommendation
      ↓
Device Command Intent
      ↓
Capability / freshness / version checks
      ↓
Policy
      ↓
Human approval where required
      ↓
Device adapter
      ↓
Execution receipt or UNKNOWN
```

The initial API only prepares command intents; it does not silently dispatch them.

## 7. Renewable Revenue Engine

The revenue engine calculates precise revenue from integer Wh and exact minor-unit rates. Supported sources include PPA revenue, grid export, local marketplace activity, incentives and carbon attributes.

Revenue calculation and treasury allocation remain separate steps.

## 8. Token Framework and CCT

PowerChain standardizes SPL, Token-2022 and Metaplex integration behind a token framework.

Canonical Solana programs include System, SPL Token, Token-2022, Associated Token Account and Metaplex Token Metadata program IDs.

**CCT — PowerChain Carbon Credit Token** is a Solana Token-2022 asset representing verified carbon attributes. CCT issuance requires methodology, verifier and evidence references. The API prepares an issuance intent only; deployment and mint authority remain configuration-gated.

PowerChain never claims that a blockchain receipt is a statutory carbon credit unless the applicable methodology and registry recognize it.

## 9. Helius IoT / DePIN

Helius can provide Solana RPC, DAS and event observations for DePIN device identity and token/program state. Helius on-chain metadata is not authoritative for meter readings, physical delivery, inverter health or renewable production.

## 10. Wayfinder

Wayfinder is an optional prepare-only route/research integration. PowerChain retains policy, approval and wallet execution authority. Provider endpoint paths are configuration-driven so the integration can evolve without embedding wallet authority into the AI layer.

## 11. Business operations

ERP, CMR, Rewards, Treasury and Vault workspaces use tenant-scoped persisted records with explicit empty and unconfigured states.

Treasury allocation commands are immutable intents. Rewards require evidence. Vault records store evidence references and credential references, not raw private keys or recovery phrases.

## 12. API

Canonical new interfaces include:

- `GET /api/v1/energy-network/search`
- `GET|POST /api/v1/local-energy/listings`
- `POST /api/v1/local-energy/reservations`
- `GET /api/v1/ems/summary`
- `GET /api/v1/erp/documents`
- `GET /api/v1/cmr/relationships`
- `GET /api/v1/rewards/allocations`
- `GET /api/v1/treasury/summary`
- `GET /api/v1/vault/records`
- `POST /api/v1/control-plane/evaluate`
- `GET /api/v1/asset-graph`
- `POST /api/v1/device-control/intents`
- `POST /api/v1/revenue/quote`
- `GET|POST /api/v1/token-framework/cct`

OpenAPI is canonical at `docs/api/swagger.yaml`; Postman artifacts live under `docs/api/postman/`.

## 13. Canonical invariants

1. Physical energy is authoritative.
2. Canonical energy accounting uses integer Wh.
3. Atomic reservation prevents oversubscription.
4. Payment confirmation is not energy delivery.
5. AI cannot bypass policy or wallet authority.
6. CCT issuance requires verified evidence.
7. Device commands are intents before execution.
8. External integrations return explicit availability/failure states.
9. Tenant-owned records are filtered by organization at the API and repository boundaries.
10. Every PowerChain package and product remains version 1.0.0.

## Positioning

PowerChain is not simply an energy marketplace and not simply a blockchain protocol. It is a controlled intelligence, operations and settlement platform that connects physical energy, renewable infrastructure, participant networks, machine data, Energy RWA, financial systems, AI workflows and blockchain execution while keeping each source of truth explicit.

## Server-side Solana observability and market resolution

PowerChain exposes Solana read state through same-origin Next.js server routes. RPC endpoints and provider credentials are server-side configuration and are never returned to browser clients. Cluster observability covers health, Solana core version, slot, block height, epoch state, latest blockhash and genesis hash. Configured PowerChain and Launchpad program addresses are verified against on-chain account state; a configured address is only classified as deployed when the account exists and is executable.

Mint inspection uses Solana RPC ownership and parsed account state to distinguish the legacy SPL Token program from Token-2022, including supply, decimals, mint/freeze authorities and parsed Token-2022 extensions when available. Helius DAS is supplemental metadata, not the authority for token-program ownership or physical-energy evidence. Market resolution is sourced and deterministic: an explicit Pyth feed mapping is preferred, followed by CoinGecko and CoinMarketCap token-by-contract data, with Birdeye retained as an optional compatibility fallback. The canonical `/api/v1/solana/market` always requires an explicit mint; only the compatibility `/api/token/market` may default to configured PWRC.

## Tokenized Copilot Response Proofs

PowerChain tokenizes the **receipt semantics** of a completed Copilot response, not the response itself as a transferable asset. Canonical v1.0.0 billing is one message unit per completed response: 10,000 PWRC, represented as 10,000,000,000,000 PWRC base units. The server persists an immutable quote hash, atomically reserves PWRC capacity, stores chat content encrypted at rest, hashes the completed response, atomically moves reserved capacity to spent, appends the credit ledger, creates an authenticated settlement receipt, and finally computes a deterministic proof hash. Failed or cancelled generations release the reservation and do not receive a settled proof. Each proof declares `transferable=false`, `mintedAsset=false`, and `financialInstrument=false`.
