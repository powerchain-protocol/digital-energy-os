# PowerChain API Tooling

Canonical API namespace:

```text
/api/v1
```

Artifacts:

```text
docs/api/swagger.yaml
docs/api/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json
docs/api/postman/PowerChain-Local.postman_environment.json
```

Runtime surfaces:

```text
/openapi.yaml
/api/v1/openapi
/swagger
/postman
```

The OpenAPI document is canonical. The platform public copy is synchronized from `docs/api/swagger.yaml`.

Economic write examples use `Idempotency-Key`.

Wallet signatures are always represented as external references rather than server-side signing operations.
