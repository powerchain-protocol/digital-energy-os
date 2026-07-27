# Installation

This guide explains how to install the PowerChain SDK for JavaScript, TypeScript, React, Vue, Angular, Node.js, Python, Go, Rust, and Flutter.

---

# Requirements

Before installing PowerChain, ensure your development environment meets the following requirements.

| Software | Version |
|----------|---------|
| Node.js | 20+ |
| npm | 10+ |
| pnpm | 11+ |
| Yarn | 4+ |
| TypeScript | 5.x (recommended) |
| Git | Latest |

Verify your installation:

```bash
node --version
npm --version
```

---

# JavaScript / TypeScript

Install the core SDK.

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

# Enterprise SDK

```bash
npm install @powerchain/sdk
```

---

# React

Install the React SDK.

```bash
npm install @powerchain/react
```

Install the UI components.

```bash
npm install @powerchain/react-ui
```

Install both together.

```bash
npm install @powerchain/react @powerchain/react-ui
```

---

# Vue

```bash
npm install @powerchain/vue
```

---

# Angular

```bash
npm install @powerchain/angular
```

---

# Node.js Runtime

```bash
npm install @powerchain/node
```

---

# Python

```bash
pip install powerchain
```

or

```bash
python -m pip install powerchain
```

---

# Go

```bash
go get github.com/powerchain/go
```

---

# Rust

```bash
cargo add powerchain
```

---

# Flutter

```bash
flutter pub add powerchain
```

---

# Developer CLI

Install globally.

```bash
npm install -g @powerchain/cli
```

or

```bash
pnpm add -g @powerchain/cli
```

Verify the installation.

```bash
powerchain --version
```

---

# Testing Framework

```bash
npm install --save-dev @powerchain/testing
```

---

# OpenAPI Code Generator

```bash
npm install --save-dev @powerchain/codegen
```

---

# Install from Source

Clone the repository.

```bash
git clone https://github.com/powerchain-protocol/powerchain.git
```

Change into the project directory.

```bash
cd powerchain
```

Install dependencies.

```bash
pnpm install
```

Build all packages.

```bash
pnpm build
```

Run the test suite.

```bash
pnpm test
```

Run the linter.

```bash
pnpm lint
```

---

# Verify Your Installation

Create a file named `index.ts`.

```typescript
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
  rpc: "https://rpc.powerchain.energy",
});

await client.connect();

console.log("PowerChain SDK installed successfully.");
```

Run the application.

```bash
npx tsx index.ts
```

Expected output:

```text
PowerChain SDK installed successfully.
```

---

# Development Installation

Install all workspace dependencies.

```bash
pnpm install
```

Build every package.

```bash
pnpm build
```

Watch for changes during development.

```bash
pnpm dev
```

Run tests.

```bash
pnpm test
```

Run tests for the core SDK only.

```bash
pnpm --filter @powerchain/web3.js test
```

---

# Troubleshooting

## Node.js Version Too Old

Upgrade to Node.js 20 or newer.

```bash
node --version
```

---

## Dependency Installation Fails

Clear the package manager cache and reinstall.

```bash
npm cache clean --force
npm install
```

or

```bash
pnpm store prune
pnpm install
```

---

## Cannot Connect to RPC

Verify your RPC endpoint.

```typescript
const client = new PowerChain({
  rpc: "https://rpc.powerchain.energy",
});
```

Check:

- Internet connectivity
- Firewall settings
- RPC endpoint availability
- Authentication credentials (if required)

---

## TypeScript Errors

Ensure your `tsconfig.json` targets modern ECMAScript.

Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "Node"
  }
}
```

---

# Next Steps

Once installation is complete, continue with:

- Getting Started
- Quick Start
- Providers
- Wallets
- Accounts
- Transactions
- Programs (Smart Contracts)
- Events & Subscriptions
- Testing
- API Reference

Happy building with **PowerChain** ⚡