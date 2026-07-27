# PowerChain SDK

<div align="center">

**Enterprise-grade blockchain development platform for building decentralized applications, enterprise systems, wallets, and smart contract applications.**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@powerchain/web3.js)](https://www.npmjs.com/package/@powerchain/web3.js)
[![Downloads](https://img.shields.io/npm/dm/@powerchain/web3.js)](https://www.npmjs.com/package/@powerchain/web3.js)
[![Build](https://img.shields.io/github/actions/workflow/status/powerchain-protocol/powerchain/ci.yml?branch=main)](https://github.com/powerchain-protocol/powerchain/actions)
[![Documentation](https://img.shields.io/badge/Docs-Latest-blue)](https://docs.powerchain.energy)

**One SDK. Every Platform.**

JavaScript • TypeScript • React • Vue • Angular • Node.js • Python • Go • Rust • Flutter

</div>

---

## Overview

PowerChain is a modern blockchain development platform providing a complete ecosystem of SDKs, developer tools, UI libraries, and framework integrations for building decentralized applications.

The project is organized as a modular monorepo where every package is independently versioned while sharing common APIs and types through the core SDK.

PowerChain is designed around four principles:

- 🚀 Performance
- 🔒 Security
- 🧩 Modularity
- 👨‍💻 Developer Experience

---

# Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Packages](#packages)
- [Repository Structure](#repository-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

# Features

## Core SDK

- High-performance JSON-RPC client
- HTTP & WebSocket providers
- Wallet generation
- HD Wallet support
- Account management
- Transaction builder
- Transaction signing
- Smart Contract (Programs) SDK
- Event subscriptions
- ABI encoder & decoder
- Address utilities
- Cryptographic utilities
- TypeScript-first API
- Browser & Node.js compatible

---

## Framework SDKs

- React
- React UI Components
- Vue
- Angular
- Flutter

---

## Backend SDKs

- Node.js
- Python
- Go
- Rust

---

## Developer Tooling

- Developer CLI
- Testing Framework
- OpenAPI Code Generator
- Project Templates
- API Documentation
- Type Definitions
- Code Examples

---

## Enterprise Features

- Authentication middleware
- Retry middleware
- Multi-network support
- Plugin architecture
- Custom providers
- Monitoring hooks
- Metrics support
- Logging middleware

---

# Architecture

```
                Applications

 React   Vue   Angular   Flutter

            │
            ▼

     @powerchain/web3.js

 ┌───────────┼────────────┐
 │           │            │
 ▼           ▼            ▼

Wallet    Provider    Programs

 │           │            │

 └───────────┼────────────┘

        JSON-RPC Client

       HTTP / WS / IPC

             │

             ▼

      PowerChain Network
```

---

# Packages

## Core Packages

| Package | Description |
|----------|-------------|
| `@powerchain/web3.js` | Core JavaScript & TypeScript SDK |
| `@powerchain/sdk` | Enterprise SDK |

---

## Frontend Packages

| Package | Description |
|----------|-------------|
| `@powerchain/react` | React SDK |
| `@powerchain/react-ui` | React Component Library |
| `@powerchain/vue` | Vue SDK |
| `@powerchain/angular` | Angular SDK |
| `@powerchain/flutter` | Flutter SDK |

---

## Backend Packages

| Package | Description |
|----------|-------------|
| `@powerchain/node` | Node.js Runtime |
| `@powerchain/python` | Python SDK |
| `@powerchain/go` | Go SDK |
| `@powerchain/rust` | Rust SDK |

---

## Developer Packages

| Package | Description |
|----------|-------------|
| `@powerchain/cli` | Developer CLI |
| `@powerchain/testing` | Testing Framework |
| `@powerchain/codegen` | OpenAPI Code Generator |

---

# Repository Structure

```
powerchain/

├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/
│
├── examples/
│   ├── wallet/
│   ├── transaction/
│   ├── programs/
│   ├── provider/
│   └── react/
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
├── scripts/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── LICENSE
└── README.md
```

---

# Requirements

| Software | Version |
|-----------|----------|
| Node.js | 20+ |
| npm | 10+ |
| pnpm | 9+ |
| Yarn | 4+ |
| TypeScript | 5.x |

Supported Platforms

- Windows
- Linux
- macOS
- Browser
- Docker
- Bun

Planned

- Deno

---

# Installation

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

```typescript
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
    rpc: "https://rpc.powerchain.energy",
});

await client.connect();

const latestBlock = await client.getBlockNumber();

console.log(latestBlock);
```

Create a wallet.

```typescript
import { Wallet } from "@powerchain/web3.js";

const wallet = Wallet.create();

console.log(wallet.address);
```

Interact with a smart contract.

```typescript
import { Contract } from "@powerchain/web3.js";

const contract = new Contract(
    CONTRACT_ADDRESS,
    ABI,
    wallet
);

const totalSupply = await contract.totalSupply();

console.log(totalSupply);
```

---

# Documentation

Documentation is organized by package.

```
docs/

packages/*/README.md

examples/
```

Documentation includes:

- Getting Started
- API Reference
- Wallet Guide
- Accounts
- Transactions
- Programs
- Providers
- Events
- CLI
- Testing
- Deployment
- Tutorials

---

# Examples

The repository contains production-ready examples.

```
examples/

wallet/

transaction/

provider/

programs/

events/

react/

vue/

angular/

flutter/
```

---

# Development

Clone the repository.

```bash
git clone https://github.com/powerchain-protocol/powerchain.git

cd powerchain
```

Install dependencies.

```bash
pnpm install
```

Build every package.

```bash
pnpm build
```

Run tests.

```bash
pnpm test
```

Run linting.

```bash
pnpm lint
```

Generate documentation.

```bash
pnpm docs
```

---

# Contributing

We welcome contributions from the community.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Add tests.
5. Run the test suite.
6. Submit a Pull Request.

Please read:

- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md

before contributing.

---

# Roadmap

## SDK

- Core SDK
- Wallet SDK
- Transactions
- Programs SDK
- Event System
- Provider System

## Frameworks

- React
- Vue
- Angular
- Flutter

## Languages

- Python
- Go
- Rust

## Tooling

- CLI
- Testing
- Code Generator
- Project Templates
- VS Code Extension

## Documentation

- API Reference
- Tutorials
- Guides
- Cookbook
- Migration Guides

---

# License

MIT License

Copyright © 2026 PowerChain

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**PowerChain — Build the Next Generation of Decentralized Applications.**

</div>
