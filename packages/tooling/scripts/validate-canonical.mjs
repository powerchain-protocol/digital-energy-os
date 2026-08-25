import {spawnSync} from 'node:child_process';
const scripts=['check-lock-sync.mjs','check-config.mjs','check-structure.mjs','check-routing.mjs','check-interactions.mjs','check-imports.mjs','check-schema.mjs','check-programs.mjs','check-contracts.mjs','check-openapi.mjs','verify-api-docs.mjs','check-migrations.mjs','check-architecture.mjs','check-ptsp.mjs','check-framework.mjs','check-docs.mjs','check-monorepo.mjs','check-duplicates.mjs'];
for(const script of scripts){const r=spawnSync(process.execPath,[`packages/tooling/scripts/${script}`],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1)}
console.log(`Canonical structural validation passed (${scripts.length}/${scripts.length}).`);
