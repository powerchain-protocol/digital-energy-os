import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("permission matrix defines enterprise roles", async () => {
  const source = await readFile(new URL("../src/lib/security/permissions.ts", import.meta.url), "utf8");
  for (const role of ["viewer", "operator", "manager", "administrator"]) assert.match(source, new RegExp(role));
});

test("package version is beta.20.0", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, "1.0.0-beta.20.0");
});
