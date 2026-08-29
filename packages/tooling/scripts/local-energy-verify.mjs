import fs from "node:fs";
const checks=[
 ["packages/database/prisma/migrations/20260828000100_control_plane_energy_ops/migration.sql",["quantity_wh BIGINT","mode TEXT NOT NULL CHECK(mode IN ('BUY','SELL','RENT'))","REVIEW_REQUIRED","SETTLEMENT_READY","idempotency_key"]],
 ["packages/database/src/repositories/operations.ts",["set transaction isolation level serializable","version=$4","available_wh >= $1","LOCAL_ENERGY_CAS_CONFLICT"]],
 ["packages/token-framework/src/index.ts",["TOKEN_2022","CCT_TOKEN","metaplexTokenMetadata"]],
 ["packages/control-plane/src/index.ts",["ActionIntent","requiresApproval"]],
 ["apps/platform/src/workspaces/p2p/components/p2p-marketplace.tsx",["RENT","/api/v1/local-energy/listings","/api/v1/local-energy/reservations"]]
];
for(const [file,needles] of checks){const text=fs.readFileSync(file,"utf8");for(const needle of needles)if(!text.includes(needle))throw new Error(`${file} missing invariant marker: ${needle}`)}
console.log("Local Energy verification passed: Wh accounting, CAS reservation, RENT, Control Plane and CCT markers are present.");
