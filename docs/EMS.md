# Energy Management System v1.0.0

PowerChain EMS is the operational boundary for renewable assets, smart meters, connected devices, Local Energy, forecasting and operator workflows.

The first-class service is `apps/ems`; reusable domain contracts live in `packages/ems`, `packages/energy-monitoring`, and `packages/device-control`.

## Authority model

```text
Physical asset / smart meter / IoT device
              ↓
Raw telemetry
              ↓
PowerChain Energy Ledger
              ↓
Validated energy period
              ↓
Evidence / analytics / action intent
              ↓
Policy + approval
              ↓
Device execution gateway or settlement workflow
```

Raw high-frequency telemetry remains off-chain. Blockchain systems carry proof, settlement, ownership, token issuance and retirement references.

Device commands are prepared and policy-evaluated first. Copilot cannot directly restart an inverter or dispatch arbitrary hardware commands.
