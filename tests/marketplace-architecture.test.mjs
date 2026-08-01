import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("marketplace architecture modules are present", () => {
  for (const path of [
    "src/types/marketplace/index.ts",
    "src/lib/marketplace/index.ts",
    "src/services/marketplace/index.ts",
    "src/events/marketplace/index.ts",
    "docs/architecture/MARKETPLACE.md",
  ]) assert.equal(fs.existsSync(path), true, path);
});

test("marketplace API aliases and recommendations are registered", () => {
  const route = read("src/app/api/v1/marketplace/recommendations/route.ts");
  assert.match(route, /getMarketplaceRecommendations/);
  assert.equal(fs.existsSync("src/app/api/v1/marketplace/dashboard/route.ts"), true);
});
