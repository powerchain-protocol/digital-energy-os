import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("Tailwind 4 uses the dedicated PostCSS plugin", () => {
  assert.equal(existsSync("postcss.config.mjs"), true);
  const config = readFileSync("postcss.config.mjs", "utf8");
  const css = readFileSync("src/styles/globals.css", "utf8");
  assert.match(config, /@tailwindcss\/postcss/);
  assert.doesNotMatch(config, /tailwindcss\s*:/);
  assert.match(css, /@import "tailwindcss";/);
  assert.doesNotMatch(css, /@tailwind\s+(base|components|utilities)/);
});
