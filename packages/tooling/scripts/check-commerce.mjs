import fs from "node:fs";
import path from "node:path";

const required=[
  "packages/explorer/package.json",
  "packages/explorer/src/index.ts",
  "packages/tokenization/package.json",
  "packages/tokenization/src/index.ts",
  "packages/database/src/repositories/commerce.ts",
  "packages/database/prisma/migrations/20260824000300_commerce_tokenization/migration.sql",
  "apps/platform/src/features/commerce/config.ts",
  "apps/platform/src/features/commerce/constants.ts",
  "apps/platform/src/features/commerce/types.ts",
  "apps/platform/src/features/commerce/utils.ts",
  "apps/platform/src/features/commerce/services/client.ts",
  "apps/platform/src/features/commerce/actions/index.ts",
  "apps/platform/src/features/commerce/context/commerce-context.tsx",
  "apps/platform/src/features/commerce/hooks/use-marketplace.ts",
  "apps/platform/src/features/commerce/hooks/use-checkout.ts",
  "apps/platform/src/features/commerce/hooks/use-explorer.ts",
  "apps/platform/src/features/commerce/hooks/use-tokenization.ts",
  "apps/platform/src/features/commerce/server.ts",
  "apps/platform/src/app/explorer/page.tsx",
  "apps/platform/src/components/explorer/explorer-workspace.tsx",
  "apps/platform/src/components/marketplace/marketplace-workspace.tsx",
  "apps/platform/src/components/checkout/checkout-card.tsx",
  "apps/platform/src/components/tokenization/tokenization-workspace.tsx",
  "apps/platform/src/app/api/v1/explorer/networks/route.ts",
  "apps/platform/src/app/api/v1/explorer/resolve/route.ts",
  "apps/platform/src/app/api/v1/marketplace/listings/route.ts",
  "apps/platform/src/app/api/v1/marketplace/orders/route.ts",
  "apps/platform/src/app/api/v1/checkout/sessions/route.ts",
  "apps/platform/src/app/api/v1/tokenization/intents/route.ts",
  "apps/platform/public/openapi.yaml",
  "apps/platform/public/swagger/index.html",
  "apps/platform/public/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json",
  "docs/api/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json",
  "docs/COMMERCE.md",
  "docs/EXPLORER.md",
  "docs/TOKENIZATION.md",
];
const errors=[];
for(const file of required)if(!fs.existsSync(file))errors.push(`Missing ${file}`);

const repository=fs.readFileSync("packages/database/src/repositories/commerce.ts","utf8");
for(const token of ["pg_advisory_xact_lock","for update","MARKETPLACE_IDEMPOTENCY_CONFLICT","CHECKOUT_IDEMPOTENCY_CONFLICT","TOKENIZATION_IDEMPOTENCY_CONFLICT","CHECKOUT_CONFLICT","TOKENIZATION_CONFLICT"]){
  if(!repository.toLowerCase().includes(token.toLowerCase()))errors.push(`Commerce repository safeguard missing: ${token}`);
}

const migration=fs.readFileSync("packages/database/prisma/migrations/20260824000300_commerce_tokenization/migration.sql","utf8");
for(const table of ["marketplace_listings","marketplace_orders","checkout_sessions","tokenization_intents"]){
  if(!migration.includes(table))errors.push(`Commerce migration missing ${table}`);
}

const runtime=fs.readFileSync("apps/platform/src/features/commerce/server.ts","utf8");
for(const token of ["representDigitalEnergyPosition","getDigitalEnergyPositionBacking","assertTokenizationAmount","markMarketplaceOrderPaid","COMMERCE_DATABASE_UNAVAILABLE"]){
  if(!runtime.includes(token))errors.push(`Commerce runtime missing ${token}`);
}
if(runtime.includes("signTransaction(")||runtime.includes("signAndSendTransaction("))errors.push("Commerce runtime must not sign user wallet transactions");

const marketplace=fs.readFileSync("apps/platform/src/components/marketplace/marketplace-workspace.tsx","utf8");
if(marketplace.includes('from "@/data/marketplace"'))errors.push("Marketplace UI still imports static demo listings");
for(const token of ["createMarketplaceOrder","createCheckout","/checkout?session="])if(!marketplace.includes(token))errors.push(`Marketplace UI not fully wired: ${token}`);

const checkout=fs.readFileSync("apps/platform/src/components/checkout/checkout-card.tsx","utf8");
for(const token of ["Review checkout","Request wallet approval","Record external signature","Confirm verified settlement"])if(!checkout.includes(token))errors.push(`Checkout UI missing lifecycle stage: ${token}`);

const tokenization=fs.readFileSync("packages/tokenization/src/index.ts","utf8");
for(const token of ["TOKENIZATION_EXCEEDS_AVAILABLE_BACKING","AWAITING_WALLET","ACTIVE_CROSS_CHAIN_REPRESENTATIONS_LE_BACKING"])if(!tokenization.includes(token))errors.push(`Tokenization invariant missing: ${token}`);

const explorer=fs.readFileSync("packages/explorer/src/index.ts","utf8");
for(const token of ["solana-mainnet-beta","sui-mainnet","resolveExplorerUrl","EXPLORER_KIND_UNSUPPORTED"])if(!explorer.includes(token))errors.push(`Explorer package missing: ${token}`);

const contracts=fs.readFileSync("packages/contracts/src/index.ts","utf8");
for(const id of ["PCC-MKT-001","PCC-CHK-001","PCC-TOK-001"])if(!contracts.includes(id))errors.push(`Contract registry missing ${id}`);

const programFiles=[
  ["packages/programs/anchor/marketplace/src/lib.rs","reservation exceeds remaining inventory"],
  ["packages/programs/anchor/escrow/src/lib.rs","invalid checkout transition"],
  ["packages/programs/anchor/energy-token/src/lib.rs","representation exceeds canonical backing"],
];
for(const[file,token]of programFiles)if(!fs.readFileSync(file,"utf8").includes(token))errors.push(`Program invariant missing in ${file}`);

const openapi=fs.readFileSync("docs/api/swagger.yaml","utf8");
for(const route of ["/explorer/resolve:","/marketplace/orders:","/checkout/sessions:","/tokenization/intents:"])if(!openapi.includes(route))errors.push(`OpenAPI missing ${route}`);

const postman=JSON.parse(fs.readFileSync("docs/api/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json","utf8"));
for(const folder of ["Explorer","Marketplace","Checkout","Tokenization","Local Energy"])if(!postman.item.some(item=>item.name===folder))errors.push(`Postman folder missing ${folder}`);

const routes=fs.readFileSync("packages/configuration/src/config/routes.ts","utf8");
if(!routes.includes('explorer: "/explorer"')||!routes.includes('swagger: "/swagger"')||!routes.includes('postman: "/postman"'))errors.push("Canonical explorer/swagger/postman routes missing");

if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("PowerChain Commerce / Explorer / Tokenization v1.0.0 canonical check passed.");
