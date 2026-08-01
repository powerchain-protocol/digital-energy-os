import { existsSync } from "node:fs";
const required = [
  "src/app", "src/components/provider/wallet-provider.tsx", "src/context/index.ts",
  "src/constants/index.ts", "src/common/index.ts", "src/lib/database/supabase",
  "src/schemas/config", "src/types/runtime/node.d.ts", "api/swagger.yaml"
];
const forbidden = ["supabase", "schema", "src/components/wallet/wallet-provider.tsx"];
const errors = [];
for (const path of required) if (!existsSync(path)) errors.push(`Missing required path: ${path}`);
for (const path of forbidden) if (existsSync(path)) errors.push(`Remove deprecated path: ${path}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("PowerChain structure check passed.");
