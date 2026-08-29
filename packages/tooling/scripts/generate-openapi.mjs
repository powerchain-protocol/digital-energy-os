import fs from "node:fs";
const yaml=fs.readFileSync("docs/api/swagger.yaml","utf8");
const json=JSON.parse(fs.readFileSync("apps/platform/public/openapi.json","utf8"));
for(const route of ["/api/v1/health","/api/v1/ready","/api/v1/powerchain/overview","/api/v1/solana/overview","/api/v1/solana/programs","/api/v1/solana/market","/api/v1/solana/assets/{mint}"]){if(!yaml.includes(route)||!json.paths?.[route])throw new Error(`OpenAPI source/public JSON drift: ${route}`)}
fs.copyFileSync("docs/api/swagger.yaml","apps/platform/public/openapi.yaml");
fs.mkdirSync("apps/platform/public/postman",{recursive:true});
fs.copyFileSync("docs/api/postman/PowerChain-v1.0.0.postman_collection.json","apps/platform/public/postman/PowerChain-v1.0.0.postman_collection.json");
console.log("OpenAPI YAML and Postman public artifacts synchronized; committed OpenAPI JSON path coverage verified.");
