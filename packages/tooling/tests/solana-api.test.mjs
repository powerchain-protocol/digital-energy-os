import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const api=fs.readFileSync("apps/platform/src/lib/server/powerchain-api.ts","utf8");
const canonical=fs.readFileSync("apps/platform/src/app/api/v1/solana/market/route.ts","utf8");
const compat=fs.readFileSync("apps/platform/src/app/api/token/market/route.ts","utf8");
const overview=fs.readFileSync("apps/platform/src/app/api/v1/solana/overview/route.ts","utf8");
const asset=fs.readFileSync("apps/platform/src/app/api/v1/solana/assets/[mint]/route.ts","utf8");

test("Solana overview exposes cluster runtime primitives through server proxy",()=>{
  for(const method of ["getHealth","getVersion","getSlot","getBlockHeight","getLatestBlockhash","getGenesisHash"])assert.match(api,new RegExp(method));
  assert.match(overview,/nextjs-server-proxy/);
});

test("PowerChain and Launchpad program addresses are verified on-chain",()=>{
  for(const value of ["POWERCHAIN_LAUNCHPAD_PROGRAM_ID","POWERCHAIN_LAUNCH_POLICY_PROGRAM_ID","POWERCHAIN_TOKEN_2022_VESTING_PROGRAM_ID","POWERCHAIN_TOKEN_FACTORY_PROGRAM_ID"])assert.match(api,new RegExp(value));
  assert.match(api,/getAccountInfo/);
  assert.match(api,/NOT_EXECUTABLE/);
  assert.match(api,/DEPLOYED/);
});

test("mint inspection distinguishes SPL Token and Token-2022",()=>{
  assert.match(api,/SPL_TOKEN/);
  assert.match(api,/TOKEN_2022/);
  assert.match(api,/mintAuthority/);
  assert.match(api,/freezeAuthority/);
  assert.match(api,/extensions/);
  assert.match(asset,/nextjs-server-proxy/);
});

test("market resolver requires explicit canonical mint and keeps PWRC compatibility default",()=>{
  assert.doesNotMatch(canonical,/configuredPwrcMint|NEXT_PUBLIC_PWRC_MINT|PWRC_MINT/);
  assert.match(compat,/configuredPwrcMint/);
  for(const provider of ["pyth","coingecko","coinmarketcap"])assert.match(api,new RegExp(provider,"i"));
});
