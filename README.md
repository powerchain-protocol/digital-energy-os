# PowerChain SDK

> Enterprise-grade blockchain development platform for building decentralized applications across JavaScript, TypeScript, Python, Go, Rust, Flutter, and more.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/github/actions/workflow/status/powerchain/sdk/ci.yml?branch=main)](#)
[![npm](https://img.shields.io/npm/v/@powerchain/web3.js)](#)

PowerChain is a modern blockchain SDK ecosystem designed for developers building decentralized applications, wallets, exchanges, enterprise systems, and smart contract platforms.

---

## Features

- 🌐 Multi-language SDKs
- ⚡ High-performance JSON-RPC client
- 🔐 Enterprise-grade security
- 👛 Wallet & account management
- ✍️ Transaction signing
- 📦 Programs (Smart contract) SDK
- 📡 WebSocket & HTTP providers
- 🧩 Framework integrations
- 🎨 UI component library
- 🧪 Testing utilities
- ⚙️ OpenAPI code generation
- 🚀 CLI tooling
- 📖 First-class TypeScript support

---

# Packages

| Package | Description |
|----------|-------------|
| **@powerchain/web3.js** | Core JavaScript & TypeScript SDK |
| **@powerchain/sdk** | Enterprise SDK |
| **@powerchain/react** | React SDK |
| **@powerchain/react-ui** | React UI Components |
| **@powerchain/vue** | Vue SDK |
| **@powerchain/angular** | Angular SDK |
| **@powerchain/node** | Node.js Runtime SDK |
| **@powerchain/python** | Python SDK |
| **@powerchain/go** | Go SDK |
| **@powerchain/rust** | Rust SDK |
| **@powerchain/flutter** | Flutter SDK |
| **@powerchain/cli** | Developer CLI |
| **@powerchain/testing** | Testing Framework |
| **@powerchain/codegen** | OpenAPI Code Generator |

---

# Repository Structure

```
powerchain/
│
├── packages/
│   ├── web3.js/
│   ├── sdk/
│   ├── react/
│   ├── react-ui/
│   ├── vue/
│   ├── angular/
│   ├── node/
│   ├── python/
│   ├── go/
│   ├── rust/
│   ├── flutter/
│   ├── cli/
│   ├── testing/
│   └── codegen/
│
├── examples/
├── docs/
├── scripts/
├── .github/
└── package.json
```

---

# Installation

Install the package that matches your project.

## JavaScript

```bash
npm install @powerchain/web3.js
```

## React

```bash
npm install @powerchain/react @powerchain/react-ui
```

## Vue

```bash
npm install @powerchain/vue
```

## Angular

```bash
npm install @powerchain/angular
```

## Node.js

```bash
npm install @powerchain/node
```

## Python

```bash
pip install powerchain
```

## Go

```bash
go get github.com/powerchain/go
```

## Rust

```bash
cargo add powerchain
```

## Flutter

```bash
flutter pub add powerchain
```

---

# Quick Start

```ts
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
  rpc: "https://rpc.powerchain.energy",
});

await client.connect();

const latestBlock = await client.getBlockNumber();

console.log(latestBlock);
```

---

# Wallet Example

```ts
import { Wallet } from "@powerchain/web3.js";

const wallet = Wallet.create();

console.log(wallet.address);

const signature = await wallet.signMessage("Hello PowerChain");
```

---

# Smart Contract Example

```ts
import { Contract } from "@powerchain/web3.js";

const token = new Contract(
    CONTRACT_ADDRESS,
    ABI,
    wallet
);

const name = await token.name();

await token.transfer(
    RECIPIENT,
    AMOUNT
);
```

---

# Development

Clone the repository.

```bash
git clone https://github.com/powerchain-protocol/powerchain.git
```

Install dependencies.

```bash
npm install
```

Build all packages.

```bash
npm run build
```

Run tests.

```bash
npm test
```

Run linting.

```bash
npm run lint
```

---

# Documentation

Documentation is organized by package.

```
docs/
packages/*/README.md
examples/
```

Future documentation will include:

- Getting Started
- API Reference
- Smart Contracts
- Wallets
- Transactions
- Providers
- CLI Guide
- Deployment
- Tutorials
- Best Practices

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Add tests
5. Open a Pull Request

Please follow the project's coding standards and ensure all tests pass.

---

# Roadmap

- Core SDK
- Wallet SDK
- Transaction SDK
- Contract SDK
- RPC Providers
- Browser SDK
- Node Runtime
- React Integration
- Vue Integration
- Angular Integration
- Flutter SDK
- CLI
- Testing Framework
- Code Generator
- API Documentation
- Examples
- CI/CD Automation

---

# License

MIT License © 2026 PowerChain
