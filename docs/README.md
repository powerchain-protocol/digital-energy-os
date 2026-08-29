# PowerChain documentation

This directory contains the normative architecture, protocol, conformance, program, security, API, and operations guidance for PowerChain 1.0.0. Machine-readable schemas live in `packages/types/src/schemas`; the canonical public API definition is `docs/api/swagger.yaml` and its generated application copy is `apps/platform/public/openapi.yaml`.

Start with the PPA architecture profile, then consult PTSP for publication rules, PEF for the framework model, and PFB for project governance. Program guidance is under `docs/programs`, security guidance is under `docs/security`, and deployment infrastructure is owned by `packages/infrastructure`.

Cloudflare, Vercel, AWS, Docker, and Kubernetes deployment guidance is in `docs/deployment/CLOUD-PROVIDERS.md`.

## Canonical v1.0.0 additions

- [Whitepaper](WHITEPAPER.md)
- [Control Plane](architecture/CONTROL-PLANE.md)
- [Energy Management System](architecture/EMS.md)
- [Local Energy](architecture/LOCAL-ENERGY.md)
- [Business Operations](architecture/BUSINESS-OPERATIONS.md)
- [CCT Program](programs/CCT.md)
- [Next.js Solana/PowerChain proxies](api/NEXTJS-SOLANA-PROXIES.md)
- [OpenAPI](api/swagger.yaml)
- [Postman collection](api/postman/PowerChain-v1.0.0.postman_collection.json)
- [Build validation](BUILD-VALIDATION.md)
- [Tokenized Copilot chat](COPILOT-TOKENIZED-CHAT.md)
- [Copilot chat UX](COPILOT-CHAT-UX.md)
