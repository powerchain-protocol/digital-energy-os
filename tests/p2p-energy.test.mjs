import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");
test("P2P workspace includes metering and escrow",()=>{
  const ui=read("src/workspaces/p2p/components/p2p-marketplace.tsx");
  assert.match(ui,/Escrow reserve/);
  assert.match(ui,/Smart meter/);
  assert.match(ui,/My energy activity/);
});
test("P2P APIs expose community and order lifecycle",()=>{
  assert.equal(fs.existsSync("src/app/api/v1/p2p/community/route.ts"),true);
  assert.equal(fs.existsSync("src/app/api/v1/p2p/orders/[id]/route.ts"),true);
  assert.match(read("src/app/api/v1/p2p/orders/route.ts"),/isSolanaAddress/);
});
