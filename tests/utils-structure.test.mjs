import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("shared utilities are organized under utils", async () => {
  await assert.rejects(access("helpers.ts"));
  for (const file of ["src/utils/helpers.ts", "src/utils/assets.ts", "src/utils/errors.ts", "src/utils/index.ts"]) {
    await access(file);
  }
});

test("routing defines legacy redirects", async () => {
  const routes = await readFile("src/config/routes.ts", "utf8");
  const nextConfig = await readFile("next.config.ts", "utf8");
  assert.match(routes, /LEGACY_REDIRECTS/);
  assert.match(nextConfig, /source: "\/login"/);
  assert.match(nextConfig, /destination: "\/auth\/signin"/);
});
