import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const required = [
  "src/store/app-store.tsx",
  "src/data/metrics.ts",
  "src/data/role-dashboards.ts",
  "src/lib/wallet/providers.ts",
  "src/lib/observability/tracing.ts",
];

test("build-critical modules exist", () => {
  for (const file of required) assert.equal(existsSync(file), true, `${file} must exist`);
});

test("instrumentation is dependency-free", () => {
  const source = readFileSync("instrumentation.ts", "utf8");
  assert.equal(source.includes("./src/lib/observability/tracing"), false);
});
