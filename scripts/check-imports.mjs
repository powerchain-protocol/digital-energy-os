import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"];
const ignoredExternal = new Set(["server-only", "client-only"]);
const errors = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function resolves(path) {
  if (existsSync(path) && statSync(path).isFile()) return true;
  for (const extension of extensions) if (existsSync(path + extension)) return true;
  for (const extension of extensions) if (existsSync(join(path, "index" + extension))) return true;
  return false;
}

const rootFiles = [join(root, "instrumentation.ts"), join(root, "proxy.ts")].filter(existsSync);
const files = [...walk(sourceRoot), ...rootFiles]
  .filter((file) => extensions.includes(extname(file)));

const importPattern = /(?:from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith("@/")) {
      const target = resolve(sourceRoot, specifier.slice(2));
      if (!resolves(target)) errors.push(`${file.slice(root.length + 1)} -> ${specifier}`);
    } else if (specifier.startsWith(".")) {
      const target = resolve(dirname(file), specifier);
      if (!resolves(target)) errors.push(`${file.slice(root.length + 1)} -> ${specifier}`);
    } else if (ignoredExternal.has(specifier)) {
      continue;
    }
  }
}

if (errors.length) {
  console.error("Unresolved local imports:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Import resolution check passed for ${files.length} source files.`);
