import { existsSync, readFileSync } from "node:fs";
const required=["apps/web","apps/api","apps/ai-gateway","apps/integration-gateway","apps/websocket-gateway","apps/workers","apps/marketplace","apps/checkout","apps/explorer","packages/widgets","packages/charts","packages/wallets","packages/tokens","packages/transactions","packages/rpc","packages/websocket","packages/pvm","packages/integration"];
const missing=required.filter((path)=>!existsSync(path));
if(missing.length){console.error(`Missing monorepo workspaces: ${missing.join(", ")}`);process.exit(1);}
for(const path of required){if(!existsSync(`${path}/package.json`)) throw new Error(`Missing ${path}/package.json`);}
console.log(`PowerChain monorepo structure is valid (${required.length} required workspaces).`);
