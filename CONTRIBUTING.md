# Contributing to PowerChain 

First off, thank you for your interest in contributing to **PowerChain**! 🎉

We welcome contributions of all kinds, including bug reports, feature requests, documentation improvements, testing, examples, performance optimizations, and code contributions.

Please read this guide before submitting changes.

---

# Table of Contents

- Code of Conduct
- Ways to Contribute
- Getting Started
- Development Environment
- Repository Structure
- Development Workflow
- Coding Standards
- Commit Messages
- Pull Requests
- Testing
- Documentation
- Reporting Bugs
- Requesting Features
- Security Issues
- Community

---

# Code of Conduct

This project follows the **Contributor Covenant Code of Conduct**.

By participating in this project, you agree to follow the guidelines described in:

```
CODE_OF_CONDUCT.md
```

Please help us maintain a welcoming, respectful, and inclusive community.

---

# Ways to Contribute

You can contribute in many ways, including:

- Reporting bugs
- Fixing bugs
- Improving documentation
- Creating tutorials
- Adding examples
- Writing tests
- Improving performance
- Reviewing pull requests
- Developing new features
- Improving developer tooling
- Translating documentation

Every contribution is appreciated.

---

# Getting Started

## 1. Fork the Repository

Fork the repository on GitHub.

## 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/powerchain.git

cd powerchain
```

## 3. Add the Upstream Repository

```bash
git remote add upstream https://github.com/powerchain-protocol/powerchain.git
```

Verify your remotes:

```bash
git remote -v
```

---

# Development Environment

## Requirements

- Node.js 20+
- pnpm 9+
- Git
- TypeScript 5.x

Install dependencies:

```bash
pnpm install
```

---

# Repository Structure

```
powerchain/

├── packages/
├── docs/
├── examples/
├── scripts/
├── .github/
└── package.json
```

---

# Development Workflow

Create a new branch for every change.

```bash
git checkout -b feature/my-feature
```

Keep your branch focused on a single change whenever possible.

---

## Build

Build every package:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm --filter @powerchain/web3.js build
```

---

## Development Mode

```bash
pnpm dev
```

---

## Run Tests

Run all tests:

```bash
pnpm test
```

Run tests for a single package:

```bash
pnpm --filter @powerchain/web3.js test
```

---

## Lint

```bash
pnpm lint
```

---

## Format

```bash
pnpm format
```

---

# Coding Standards

We aim for readable, maintainable, and consistent code.

## TypeScript

- Use strict mode.
- Avoid the `any` type unless absolutely necessary.
- Prefer interfaces for public APIs.
- Export named types where appropriate.
- Keep functions small and focused.

## Naming

### Files

```
wallet.ts
transaction.ts
provider.ts
```

### Classes

```ts
Wallet
Transaction
Provider
```

### Interfaces

```ts
WalletOptions
TransactionRequest
```

### Constants

```ts
DEFAULT_RPC_URL
MAX_TRANSACTION_SIZE
```

---

# Documentation

All public APIs should include documentation comments.

Example:

```ts
/**
 * Connects to a PowerChain RPC endpoint.
 */
connect(): Promise<void>
```

Update documentation whenever behavior changes.

---

# Tests

Every new feature should include tests.

Suggested test categories:

- Unit tests
- Integration tests
- Regression tests
- Edge cases

Aim to avoid reducing test coverage.

---

# Commit Messages

Use clear, descriptive commit messages.

Examples:

```text
feat(wallet): add mnemonic import

fix(provider): reconnect websocket

docs: improve installation guide

refactor(client): simplify rpc pipeline

test(transaction): add serialization tests
```

Prefer following the Conventional Commits specification.

---

# Pull Requests

Before opening a pull request:

- Ensure the project builds successfully.
- Ensure all tests pass.
- Run the linter.
- Update documentation if needed.
- Keep the pull request focused on one topic.

Include:

- A clear description of the change
- Motivation
- Screenshots (if applicable)
- Linked issues (if applicable)

---

# Reporting Bugs

Before creating a bug report:

- Search existing issues.
- Reproduce the issue using the latest version.
- Collect relevant logs and error messages.

Please include:

- PowerChain version
- Operating system
- Node.js version
- Steps to reproduce
- Expected behavior
- Actual behavior

---

# Feature Requests

Feature requests are welcome.

Include:

- Problem statement
- Proposed solution
- Alternative approaches considered
- Additional context or examples

---

# Security Issues

Please do **not** disclose security vulnerabilities publicly.

Instead, follow the responsible disclosure process described in:

```
SECURITY.md
```

---

# Documentation Contributions

Documentation improvements are always welcome.

Examples include:

- Fixing typos
- Clarifying guides
- Adding examples
- Improving API explanations
- Expanding tutorials

---

# Community

We welcome contributors of all experience levels.

Be respectful.

Be constructive.

Be collaborative.

Help others learn and succeed.

---

# License

By contributing to PowerChain, you agree that your contributions will be licensed under the project's MIT License unless otherwise stated.

Thank you for helping make **PowerChain** better! ⚡