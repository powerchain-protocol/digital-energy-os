# @powerchain/web3.js

<div align="center">

# ⚡ PowerChain Web3.js

**The official JavaScript & TypeScript SDK for the PowerChain Network**

Build decentralized applications, wallets, exchanges, blockchain explorers, backend services, and enterprise applications with a modern, type-safe SDK.

[![npm](https://img.shields.io/npm/v/@powerchain/web3.js)](https://www.npmjs.com/package/@powerchain/web3.js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/github/actions/workflow/status/powerchain-protocol/powerchain/ci.yml?branch=main)](https://github.com/powerchain-protocol/powerchain/actions)
[![Downloads](https://img.shields.io/npm/dm/@powerchain/web3.js)](https://www.npmjs.com/package/@powerchain/web3.js)

</div>

---

# Table of Contents

- Overview
- Features
- Installation
- Requirements
- Quick Start
- Connecting to PowerChain
- Wallets
- Accounts
- Transactions
- Smart Contracts (Programs)
- Events & Subscriptions
- Providers
- Examples
- API Overview
- Project Structure
- Development
- Testing
- Documentation
- Browser Support
- Node.js Support
- Roadmap
- Contributing
- License

---

# Overview

`@powerchain/web3.js` is the official JavaScript and TypeScript SDK for interacting with the **PowerChain Network**.

It provides a complete developer toolkit for building decentralized applications with modern APIs, strong typing, modular architecture, and first-class support for both browser and Node.js environments.

The SDK includes:

- JSON-RPC client
- HTTP & WebSocket providers
- Wallet management
- Transaction builder
- Cryptographic utilities
- Smart contract (Program) interaction
- Event subscriptions
- ABI encoding and decoding
- TypeScript support
- Modular architecture
- Tree-shakeable ES modules

---

# Features

## Client

- JSON-RPC 2.0
- Automatic reconnect
- Request batching
- Middleware support
- Retry logic
- Timeout handling
- Multiple providers

## Wallet

- Wallet generation
- HD wallets
- Mnemonic phrases
- Private key import/export
- Secure signing
- Message signing
- Transaction signing

## Transactions

- Create transactions
- Estimate fees
- Serialize
- Deserialize
- Broadcast
- Offline signing
- Receipt parsing

## Smart Contracts

- Deploy contracts
- Read state
- Write transactions
- ABI encoding
- ABI decoding
- Event decoding
- Contract instances

## Utilities

- Address validation
- Hashing
- Base58
- Hex conversion
- Unit conversion
- Random bytes
- Key generation

---

# Installation

### npm

```bash
npm install @powerchain/web3.js
```

### pnpm

```bash
pnpm add @powerchain/web3.js
```

### Yarn

```bash
yarn add @powerchain/web3.js
```

### Bun

```bash
bun add @powerchain/web3.js
```

---

# Requirements

| Software | Version |
|----------|----------|
| Node.js | 20+ |
| TypeScript | 5.x |
| npm | 10+ |
| pnpm | 11+ |
| Yarn | 4+ |

---

# Quick Start

```typescript
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
  rpc: "https://rpc.powerchain.energy",
});

await client.connect();

const latestBlock = await client.getBlockNumber();

console.log(latestBlock);
```

---

# Connecting to PowerChain

```typescript
import { HttpProvider } from "@powerchain/web3.js";

const provider = new HttpProvider({
  url: "https://rpc.powerchain.energy",
});

const client = new PowerChain({
  provider,
});

await client.connect();
```

---

# Wallets

Create a wallet.

```typescript
import { Wallet } from "@powerchain/web3.js";

const wallet = Wallet.create();

console.log(wallet.address);
```

Import a private key.

```typescript
const wallet = Wallet.fromPrivateKey(
  process.env.PRIVATE_KEY!
);
```

Generate from a mnemonic.

```typescript
const wallet = Wallet.fromMnemonic(
  process.env.MNEMONIC!
);
```

---

# Accounts

Retrieve balance.

```typescript
const balance = await client.getBalance(
  wallet.address
);

console.log(balance);
```

Get nonce.

```typescript
const nonce = await client.getTransactionCount(
  wallet.address
);
```

---

# Transactions

Send tokens.

```typescript
await client.sendTransaction({
  from: wallet,
  to: RECIPIENT,
  value: "1000000000",
});
```

Estimate fees.

```typescript
const fee = await client.estimateFee({
  from: wallet.address,
  to: RECIPIENT,
});
```

---

# Smart Contracts (Programs)

```typescript
import { Contract } from "@powerchain/web3.js";

const contract = new Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

const name = await contract.name();

console.log(name);
```

Execute a transaction.

```typescript
await contract.transfer(
  RECIPIENT,
  AMOUNT
);
```

---

# Events & Subscriptions

Subscribe to blocks.

```typescript
client.on("block", (block) => {
  console.log(block.number);
});
```

Subscribe to transactions.

```typescript
client.on("transaction", (tx) => {
  console.log(tx.hash);
});
```

Subscribe to contract events.

```typescript
contract.on("Transfer", (event) => {
  console.log(event);
});
```

---

# Providers

Supported providers:

- HTTP
- HTTPS
- WebSocket
- Secure WebSocket
- Custom providers

Example:

```typescript
import { WebSocketProvider } from "@powerchain/web3.js";

const provider = new WebSocketProvider({
  url: "wss://rpc.powerchain.energy",
});
```

---

# Examples

```
examples/

connect.ts

wallet.ts

balance.ts

transfer.ts

contract.ts

events.ts

websocket.ts
```

Run an example.

```bash
pnpm tsx examples/connect.ts
```

---

# API Overview

## Client

```typescript
PowerChain
```

## Providers

```typescript
Provider

HttpProvider

WebSocketProvider
```

## Wallet

```typescript
Wallet

HDWallet

Signer
```

## Transactions

```typescript
Transaction

TransactionBuilder

TransactionReceipt
```

## Contracts

```typescript
Contract

Program
```

## Crypto

```typescript
Address

Hash

Keypair

Encoding
```

---

# Project Structure

```
packages/web3.js/

src/
├── client/
├── providers/
├── wallet/
├── transaction/
├── contract/
├── crypto/
├── rpc/
├── utils/
├── constants.ts
├── errors.ts
├── types.ts
└── index.ts

examples/

test/

README.md
```

---

# Development

Clone the repository.

```bash
git clone https://github.com/powerchain-protocol/powerchain.git
```

Install dependencies.

```bash
pnpm install
```

Build the SDK.

```bash
pnpm --filter @powerchain/web3.js build
```

Watch mode.

```bash
pnpm --filter @powerchain/web3.js dev
```

---

# Testing

Run all tests.

```bash
pnpm --filter @powerchain/web3.js test
```

Generate coverage.

```bash
pnpm --filter @powerchain/web3.js coverage
```

---

# Documentation

Documentation includes:

- Getting Started
- Installation
- Wallet Guide
- Transactions
- Providers
- Smart Contracts
- Events
- API Reference
- Tutorials
- Examples
- Migration Guide

---

# Browser Support

- Chrome
- Firefox
- Safari
- Microsoft Edge

---

# Node.js Support

Supported runtimes:

- Node.js 20+
- Bun
- Deno (planned)

---

# Roadmap

- Core SDK
- Wallet SDK
- Transaction SDK
- Smart Contract SDK
- Event System
- Plugin API
- Browser Extension Support
- Hardware Wallet Integration
- Mobile SDK
- Multi-network Support

---

# Contributing

Contributions are welcome.

Please read:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`

before opening issues or pull requests.

---

# License

MIT License

Copyright © 2026 PowerChain

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the PowerChain Team**

Official JavaScript & TypeScript SDK for the PowerChain Network.

</div>