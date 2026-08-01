import fs from "node:fs";
import path from "node:path";

const required = [
  "standards/catalog.json",
  "docs/PTSP/README.md",
  "docs/PTSP/classification.md",
  "docs/PTSP/compatibility-policy.md",
  "docs/PTSP/publication-lifecycle.md",
  "docs/conformance/profiles.md",
  "engineering/traceability/matrix.json",
  "src/app/standards/page.tsx",
  "src/app/api/v1/standards/catalog/route.ts",
];
const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) { console.error(`PTSP check failed:\n${missing.map((file) => `- Missing ${file}`).join("\n")}`); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync("standards/catalog.json", "utf8"));
if (catalog.program !== "PTSP" || !Array.isArray(catalog.lifecycle) || catalog.lifecycle.length !== 8) { console.error("PTSP catalog metadata is invalid."); process.exit(1); }
const matrix = JSON.parse(fs.readFileSync("engineering/traceability/matrix.json", "utf8"));
if (!Array.isArray(matrix.requirements) || matrix.requirements.length < 1) { console.error("PTSP traceability matrix is empty."); process.exit(1); }
console.log("PTSP portfolio, governance, lifecycle and traceability checks passed.");
