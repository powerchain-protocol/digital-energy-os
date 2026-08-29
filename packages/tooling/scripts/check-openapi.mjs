import fs from "node:fs";
const route="apps/platform/src/app/api/v1/openapi/route.ts";
if(!fs.existsSync(route))throw new Error("OpenAPI route missing");
for(const file of ["apps/platform/src/app/api/v1/openapi.json/route.ts","apps/platform/src/app/api/v1/openapi.yaml/route.ts","apps/platform/src/app/api/swagger/route.ts","apps/platform/src/app/api/postman/route.ts","apps/platform/public/openapi.json","apps/platform/public/openapi.yaml","apps/platform/public/postman/PowerChain-v1.0.0.postman_collection.json"]){if(!fs.existsSync(file))throw new Error(`Developer API artifact missing ${file}`)}
const api=fs.readFileSync("docs/api/swagger.yaml","utf8");
for(const value of [
  "/api/v1/health","/api/v1/ready","/api/v1/projects","/api/v1/projects/{slug}","/api/v1/programs","/api/v1/token/allocations",
  "/api/v1/powerchain/overview","/api/v1/powerchain/programs","/api/v1/solana/overview","/api/v1/solana/programs","/api/v1/solana/market","/api/v1/solana/assets/{mint}",
  "/api/v1/config/public","/api/v1/me","/api/swagger/","/api/v1/openapi.json","/api/v1/openapi.yaml","/api/postman",
  "/api/solana/overview","/api/token/market","/api/assets/{mint}",
  "/api/v1/local-energy/listings","/api/v1/local-energy/reservations","/api/v1/energy-network/search","/api/v1/ems/summary","/api/v1/erp/documents","/api/v1/cmr/relationships","/api/v1/rewards/allocations","/api/v1/treasury/summary","/api/v1/vault/records","/api/v1/control-plane/evaluate","/api/v1/token-framework/cct",
  "/api/v1/chat/conversations/{conversationId}/credits","/api/v1/chat/conversations/{conversationId}/messages/{messageId}/proof","/api/v1/credits/chat/{conversationId}","/api/v1/chat/credits"
])if(!api.includes(value))throw new Error(`OpenAPI missing ${value}`);
const collection=JSON.parse(fs.readFileSync("docs/api/postman/PowerChain-v1.0.0.postman_collection.json","utf8"));
const raw=JSON.stringify(collection);
for(const value of ["/api/v1/health","/api/v1/ready","/api/v1/powerchain/overview","/api/v1/solana/overview","/api/v1/solana/programs","/api/v1/solana/market","/api/v1/solana/assets/","/api/v1/config/public","/api/v1/me","/api/v1/openapi.json","/api/v1/openapi.yaml","/api/swagger/","/api/postman","/chat/conversations/","/messages/","/proof","/credits/chat/"])if(!raw.includes(value))throw new Error(`Postman missing ${value}`);

const publicSpec=JSON.parse(fs.readFileSync("apps/platform/public/openapi.json","utf8"));
const canonicalMint=publicSpec.paths?.["/api/v1/solana/market"]?.get?.parameters?.find?.(p=>p.name==="mint");
if(!canonicalMint?.required)throw new Error("Canonical /api/v1/solana/market must require explicit mint");
const compatMint=publicSpec.paths?.["/api/token/market"]?.get?.parameters?.find?.(p=>p.name==="mint");
if(compatMint?.required)throw new Error("Compatibility /api/token/market must keep mint optional for PWRC defaulting");
const canonicalMarketSource=fs.readFileSync("apps/platform/src/app/api/v1/solana/market/route.ts","utf8");
if(/NEXT_PUBLIC_PWRC_MINT|configuredPwrcMint/.test(canonicalMarketSource))throw new Error("Canonical v1 market route must not default the mint");
for(const alias of ["apps/platform/src/app/api/solana/overview/route.ts","apps/platform/src/app/api/token/market/route.ts","apps/platform/src/app/api/assets/[mint]/route.ts"]){if(!fs.readFileSync(alias,"utf8").includes("@/lib/server/powerchain-api"))throw new Error(`Compatibility alias must delegate to canonical service: ${alias}`);}

console.log("OpenAPI, Swagger and Postman canonical v1.0.0 operations present");
