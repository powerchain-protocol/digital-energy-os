# Getting Started

Welcome to **PowerChain SDK**! This guide will help you install the SDK, connect to a PowerChain node, create your first wallet, and interact with the blockchain.

---

# Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22 or later
- **npm**, **pnpm**, or **Yarn**
- **Git**
- A PowerChain RPC endpoint

Verify your installation:

```bash
node --version
npm --version
```

---

# Installation

Install the core SDK:

```bash
npm install @powerchain/web3.js
```

or with pnpm:

```bash
pnpm add @powerchain/web3.js
```

or Yarn:

```bash
yarn add @powerchain/web3.js
```

---

# Create Your First Project

Create a new project:

```bash
mkdir hello-powerchain

cd hello-powerchain

npm init -y
```

Install dependencies:

```bash
npm install @powerchain/web3.js
```

If using TypeScript:

```bash
npm install -D typescript tsx @types/node

npx tsc --init
```

---

# Connect to PowerChain

Create a file named `index.ts`.

```typescript
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
    rpc: "https://rpc.powerchain.energy",
});

await client.connect();

console.log("Connected!");
```

Run:

```bash
npx tsx index.ts
```

Expected output:

```text
Connected!
```

---

# Get the Latest Block

```typescript
const block = await client.getBlockNumber();

console.log(block);
```

---

# Create a Wallet

```typescript
import { Wallet } from "@powerchain/web3.js";

const wallet = Wallet.create();

console.log(wallet.address);
```

Example output:

```text
Address:
PC1x7v...9jA
```

---

# Import an Existing Wallet

```typescript
const wallet = Wallet.fromPrivateKey(
    process.env.PRIVATE_KEY!
);
```

---

# Check Account Balance

```typescript
const balance = await client.getBalance(
    wallet.address
);

console.log(balance);
```

---

# Send a Transaction

```typescript
await client.sendTransaction({
    from: wallet,
    to: RECIPIENT,
    value: "1000000000",
});
```

---

# Sign a Message

```typescript
const signature = await wallet.signMessage(
    "Hello PowerChain"
);

console.log(signature);
```

---

# Smart Contract (Program) Example

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

Call a method:

```typescript
const supply = await contract.totalSupply();
```

Send a transaction:

```typescript
await contract.transfer(
    RECIPIENT,
    AMOUNT
);
```

---

# Subscribe to New Blocks

```typescript
client.on("block", (block) => {
    console.log(block.number);
});
```

---

# Project Structure

```
my-project/

├── package.json
├── tsconfig.json
├── src/
│   └── index.ts
└── node_modules/
```

---

# Environment Variables

Create a `.env` file.

```env
POWERCHAIN_RPC=https://rpc.powerchain.energy

PRIVATE_KEY=YOUR_PRIVATE_KEY
```

Load the environment:

```typescript
import "dotenv/config";
```

---

# Running the Project

Development:

```bash
npx tsx src/index.ts
```

Production:

```bash
npm run build

node dist/index.js
```

---

# Next Steps

Now that you've connected to PowerChain, explore the following guides:

- **Installation**
- **Wallet Guide**
- **Accounts**
- **Transactions**
- **Providers**
- **Programs (Smart Contracts)**
- **Events & Subscriptions**
- **Testing**
- **CLI**
- **API Reference**

---

# Example Application

```typescript
import { PowerChain, Wallet } from "@powerchain/web3.js";

const client = new PowerChain({
    rpc: process.env.POWERCHAIN_RPC,
});

await client.connect();

const wallet = Wallet.create();

console.log("Address:", wallet.address);

const latest = await client.getBlockNumber();

console.log("Latest Block:", latest);
```

---

# Troubleshooting

## Unable to Connect

- Verify the RPC endpoint.
- Check your internet connection.
- Ensure the node is online.

## Invalid Private Key

- Confirm the key format.
- Do not include extra spaces or quotes.

## Transaction Failed

- Check your account balance.
- Verify the recipient address.
- Ensure sufficient fees are available.

---

# Need Help?

- Read the API Reference.
- Browse the examples in the `examples/` directory.
- Open an issue on the project's GitHub repository.
- Join the PowerChain developer community.

Happy building with **PowerChain**! ⚡