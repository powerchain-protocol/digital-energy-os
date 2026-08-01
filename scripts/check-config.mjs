import fs from "node:fs";

const forbidden = ["auth.ts", "iot.ts", "depin.ts", "middleware.ts"];
for (const file of forbidden) {
  if (fs.existsSync(file)) throw new Error(`Root file should be organized elsewhere: ${file}`);
}

const required = [
  "proxy.ts",
  "src/config/networks.ts",
  "src/config/server-networks.ts",
  "src/config/status.ts",
  "src/env/schema.ts",
  "src/env/client.ts",
  "src/env/server.ts",
  "src/env/index.ts",
  "tsconfig.e2e.json"
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing required config: ${file}`);
}
console.log("Configuration checks passed");
