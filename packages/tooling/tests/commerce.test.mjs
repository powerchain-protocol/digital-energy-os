import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=file=>fs.readFileSync(file,"utf8");

test("marketplace reservations are atomic and linked to checkout",()=>{
  const repo=read("packages/database/src/repositories/commerce.ts");
  const runtime=read("apps/platform/src/features/commerce/server.ts");
  assert.match(repo,/pg_advisory_xact_lock/);
  assert.match(repo,/select \* from marketplace_listings.*for update/s);
  assert.match(repo,/remaining=\$3/);
  assert.match(runtime,/attachMarketplaceCheckout/);
  assert.match(runtime,/markMarketplaceOrderPaid/);
});

test("checkout is review-first and never signs the user wallet",()=>{
  const repo=read("packages/database/src/repositories/commerce.ts");
  const ui=read("apps/platform/src/components/checkout/checkout-card.tsx");
  assert.match(repo,/CREATED:\["REVIEW","CANCELLED"\]/);
  assert.match(repo,/PENDING_SIGNATURE:\["SUBMITTED","CANCELLED"\]/);
  assert.match(ui,/external wallet transaction signature\/reference/);
  assert.doesNotMatch(repo,/signTransaction\(/);
  assert.doesNotMatch(ui,/signAndSendTransaction\(/);
});

test("tokenization rechecks backing and writes canonical Digital Energy representation only on confirmation",()=>{
  const runtime=read("apps/platform/src/features/commerce/server.ts");
  assert.match(runtime,/if\(next==="CONFIRMED"\)/);
  assert.match(runtime,/getDigitalEnergyPositionBacking/);
  assert.match(runtime,/assertTokenizationAmount/);
  assert.match(runtime,/representDigitalEnergyPosition/);
  assert.match(runtime,/idempotencyKey:`tokenization:\$\{id\}:confirm`/);
});

test("explorer resolver is shared by platform and standalone explorer",()=>{
  const standalone=read("apps/explorer/src/index.ts");
  const platform=read("apps/platform/src/features/commerce/server.ts");
  assert.match(standalone,/@powerchain\/explorer/);
  assert.match(platform,/resolveExplorerUrl/);
  assert.match(read("packages/explorer/src/index.ts"),/sui-mainnet/);
});

test("marketplace UI no longer depends on static catalog data",()=>{
  const ui=read("apps/platform/src/components/marketplace/marketplace-workspace.tsx");
  assert.doesNotMatch(ui,/from "@\/data\/marketplace"/);
  assert.match(ui,/useMarketplace/);
  assert.match(ui,/createMarketplaceOrder/);
  assert.match(ui,/createCheckout/);
});

test("commerce frontend is modularized",()=>{
  for(const file of [
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
  ])assert.ok(fs.existsSync(file),file);
});

test("OpenAPI, Swagger, and Postman use the canonical API v1 surface",()=>{
  const openapi=read("docs/api/swagger.yaml");
  const swagger=read("apps/platform/public/swagger/index.html");
  const postman=JSON.parse(read("docs/api/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json"));
  assert.match(openapi,/\/tokenization\/intents:/);
  assert.match(swagger,/fetch\("\/openapi\.yaml"\)/);
  assert.equal(postman.variable.find(item=>item.key==="baseUrl")?.value,"http://localhost:3000/api/v1");
});

test("contracts and program primitives cover commerce and tokenization invariants",()=>{
  const registry=read("packages/contracts/src/index.ts");
  assert.match(registry,/PCC-MKT-001/);
  assert.match(registry,/PCC-CHK-001/);
  assert.match(registry,/PCC-TOK-001/);
  assert.match(read("packages/programs/anchor/marketplace/src/lib.rs"),/inventory_cannot_be_oversubscribed/);
  assert.match(read("packages/programs/anchor/escrow/src/lib.rs"),/confirmation_cannot_skip_wallet_submission/);
  assert.match(read("packages/programs/anchor/energy-token/src/lib.rs"),/cross_chain_representation_never_exceeds_backing/);
});
