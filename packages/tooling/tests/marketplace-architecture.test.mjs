import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");

test("marketplace architecture is owned by the canonical commerce feature",()=>{
  for(const path of [
    "apps/platform/src/features/commerce/server.ts",
    "apps/platform/src/features/commerce/services/client.ts",
    "apps/platform/src/features/commerce/hooks/use-marketplace.ts",
    "packages/database/src/repositories/commerce.ts",
    "docs/COMMERCE.md",
  ])assert.equal(fs.existsSync(path),true,path);
  assert.equal(fs.existsSync("apps/platform/src/services/marketplace/index.ts"),false);
  assert.equal(fs.existsSync("apps/platform/src/components/marketplace/listing-card.tsx"),false);
});

test("marketplace dashboard and recommendations use tenant-scoped commerce services",()=>{
  const dashboard=read("apps/platform/src/app/api/v1/marketplace/dashboard/route.ts");
  const recommendations=read("apps/platform/src/app/api/v1/marketplace/recommendations/route.ts");
  assert.match(dashboard,/listMarketplace/);
  assert.match(dashboard,/listMarketplaceOrders/);
  assert.match(recommendations,/listMarketplace/);
  assert.doesNotMatch(recommendations,/getMarketplaceRecommendations/);
});
