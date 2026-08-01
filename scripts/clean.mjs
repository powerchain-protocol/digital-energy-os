import { rm } from "node:fs/promises";

await Promise.all([
  rm(".next", { recursive: true, force: true }),
  rm("coverage", { recursive: true, force: true }),
  rm("tsconfig.tsbuildinfo", { force: true }),
]);

console.log("PowerChain build artifacts removed.");
