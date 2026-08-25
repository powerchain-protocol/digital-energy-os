import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const version=fs.readFileSync('VERSION','utf8').trim();if(version!=='1.0.0'){console.error(`VERSION must be 1.0.0, got ${version}`);process.exit(1)}
let r=spawnSync(process.execPath,['packages/tooling/scripts/validate-canonical.mjs'],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
if(fs.existsSync('.git')){r=spawnSync('git',['ls-files','--error-unmatch','pnpm-lock.yaml'],{stdio:'ignore'});if(r.status!==0){console.error('Production release verification requires pnpm-lock.yaml to be committed.');process.exit(1)}}else console.warn('Archive validation: no .git metadata, so committed-lock certification cannot be performed.');
console.log('Release structure verified. Installed-dependency typecheck/build still require the target Node/pnpm environment.');
