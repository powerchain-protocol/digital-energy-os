# PowerChain SDK

PowerChain is a comprehensive blockchain development platform that provides SDKs, UI components, and developer tools for building decentralized applications across multiple languages and frameworks.

## Features

- 🌐 Multi-language SDK support
- ⚛️ Framework integrations for React, Vue, Angular, and Flutter
- 🔐 Enterprise-grade SDK
- 🧩 Reusable UI component library
- 🖥️ Node.js runtime support
- 🧪 Testing framework
- ⚙️ OpenAPI code generation
- 🚀 Developer CLI
- 📚 Consistent APIs across all supported platforms

## Packages

| Package | Description |
|---------|-------------|
| `@powerchain/web3.js` | Core JavaScript/TypeScript SDK for interacting with PowerChain. |
| `@powerchain/sdk` | Enterprise SDK with advanced features and enterprise integrations. |
| `@powerchain/react` | React integration for PowerChain applications. |
| `@powerchain/react-ui` | React UI component library. |
| `@powerchain/vue` | Vue.js SDK. |
| `@powerchain/angular` | Angular SDK. |
| `@powerchain/node` | Node.js runtime SDK for backend applications. |
| `@powerchain/python` | Python SDK. |
| `@powerchain/go` | Go SDK. |
| `@powerchain/rust` | Rust SDK. |
| `@powerchain/flutter` | Flutter SDK for mobile development. |
| `@powerchain/cli` | Command-line interface for project creation and deployment. |
| `@powerchain/testing` | Testing framework and utilities. |
| `@powerchain/codegen` | OpenAPI Code Generator for generating API clients and SDKs. |

## Installation

Install the package that matches your development stack.

### JavaScript / TypeScript

```bash
npm install @powerchain/web3.js
```

### React

```bash
npm install @powerchain/react @powerchain/react-ui
```

### Vue

```bash
npm install @powerchain/vue
```

### Angular

```bash
npm install @powerchain/angular
```

### Node.js

```bash
npm install @powerchain/node
```

### Python

```bash
pip install powerchain
```

### Go

```bash
go get github.com/powerchain/go
```

### Rust

```bash
cargo add powerchain
```

### Flutter

```bash
flutter pub add powerchain
```

## Quick Start

### JavaScript

```javascript
import { PowerChain } from "@powerchain/web3.js";

const client = new PowerChain({
  apiKey: process.env.POWERCHAIN_API_KEY,
});

await client.connect();
```

### React

```tsx
import { PowerChainProvider } from "@powerchain/react";

export default function App() {
  return (
    <PowerChainProvider apiKey={process.env.REACT_APP_POWERCHAIN_API_KEY}>
      {/* Your application */}
    </PowerChainProvider>
  );
}
```

## Developer Tools

PowerChain includes additional tools to improve the developer experience.

- **CLI** – Scaffold projects, manage deployments, and automate workflows.
- **Testing Framework** – Build reliable applications with testing utilities.
- **Code Generator** – Generate SDKs and API clients from OpenAPI specifications.

## Documentation

Documentation for each package is located in its respective directory.

- `/packages/web3.js`
- `/packages/sdk`
- `/packages/react`
- `/packages/react-ui`
- `/packages/vue`
- `/packages/angular`
- `/packages/node`
- `/packages/python`
- `/packages/go`
- `/packages/rust`
- `/packages/flutter`
- `/packages/cli`
- `/packages/testing`
- `/packages/codegen`

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

Please ensure all tests pass before submitting changes.

## License

This project is licensed under the MIT License.
