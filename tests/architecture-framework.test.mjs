import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("PPA architecture page and catalog exist", () => {
  assert.equal(existsSync("src/app/architecture/page.tsx"), true);
  assert.equal(existsSync("src/app/api/v1/architecture/catalog/route.ts"), true);
});

test("PPA standard catalog contains Proof of Energy and Conformance", () => {
  const content = readFileSync("src/data/architecture/index.ts", "utf8");
  assert.match(content, /PPA-210/);
  assert.match(content, /PPA-800/);
});
