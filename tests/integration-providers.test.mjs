import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const providers=["onramp","circle","pyth","jupiter","raydium","orca","meteora","helius","metaplex","helium","cetus","streamflow"];
test("web3 provider adapters are isolated",()=>{for(const provider of providers)assert.ok(fs.existsSync(`packages/integration/src/web3/${provider}/index.ts`),provider)});
test("Next config is Turbopack-native",()=>{const config=fs.readFileSync("next.config.ts","utf8");assert.match(config,/turbopack:\s*\{\}/);assert.doesNotMatch(config,/webpack\s*\(/)});
test("contract prose is separated from machine artifacts",()=>{assert.ok(fs.existsSync("packages/contracts/src/index.ts"));assert.ok(fs.existsSync("docs/contracts/m/proof-of-energy/README.md"));});
