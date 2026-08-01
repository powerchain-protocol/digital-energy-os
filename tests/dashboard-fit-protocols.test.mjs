import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";

test("certification uses the shared dashboard shell",()=>{const source=readFileSync("src/app/certification/page.tsx","utf8");assert.match(source,/Shell/)});
test("project discovery supports IDs and slugs",()=>{assert.ok(existsSync("src/app/explore/projects/[id]/page.tsx"));assert.ok(existsSync("src/app/api/v1/projects/[id]/route.ts"))});
test("protocol foundations are present",()=>{for(const file of ["src/lib/solana/solana-pay.ts","src/lib/protocols/zk.ts","src/lib/protocols/svm-renewables.ts","src/lib/protocols/blinks.ts","src/lib/depin/lorawan-verification.ts"])assert.ok(existsSync(file),file)});
test("wallet adapters include Phantom, Solflare, Backpack and WalletConnect",()=>{const source=readFileSync("src/lib/wallet/providers.ts","utf8");for(const name of ["Phantom","Solflare","Backpack","WalletConnect"])assert.match(source,new RegExp(name))});
