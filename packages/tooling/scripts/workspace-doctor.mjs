import {spawnSync} from 'node:child_process';
const checks=['check-lock-sync.mjs','check-config.mjs','check-structure.mjs','check-routing.mjs','check-imports.mjs','check-monorepo.mjs','check-duplicates.mjs'];
let failed=0;
for(const script of checks){const r=spawnSync(process.execPath,[`packages/tooling/scripts/${script}`],{stdio:'inherit'});if(r.status!==0){failed=1;break}}
if(failed)process.exit(1);console.log('Workspace doctor passed.');
