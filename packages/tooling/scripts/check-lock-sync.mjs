import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const lockText=fs.readFileSync(path.join(root,'pnpm-lock.yaml'),'utf8');
const importersText=(lockText.match(/^importers:\s*\n([\s\S]*?)(?=^packages:\s*$)/m)?.[1])??'';
const lines=importersText.split(/\r?\n/);
const lock=new Map();
let importer=null,section=null,dependency=null;
const unquote=value=>value.replace(/^['"]|['"]$/g,'');
for(const line of lines){
  let m;
  if((m=line.match(/^  ([^\s].*?):(?:\s*\{\})?\s*$/))){importer=unquote(m[1]);section=null;dependency=null;if(!lock.has(importer))lock.set(importer,new Map());continue}
  if((m=line.match(/^    (dependencies|devDependencies|optionalDependencies):\s*$/))){section=m[1];dependency=null;continue}
  if(section&&(m=line.match(/^      (.+?):\s*$/))){dependency=unquote(m[1]);continue}
  if(importer&&section&&dependency&&(m=line.match(/^        specifier:\s*(.+?)\s*$/))){lock.get(importer).set(`${section}:${dependency}`,unquote(m[1]));}
}
const manifests=[
  path.join(root,'package.json'),
  ...fs.readdirSync(path.join(root,'apps')).flatMap(name=>{const p=path.join(root,'apps',name,'package.json');return fs.existsSync(p)?[p]:[]}),
  ...fs.readdirSync(path.join(root,'packages')).flatMap(name=>{const p=path.join(root,'packages',name,'package.json');return fs.existsSync(p)?[p]:[]}),
];
const errors=[];
const expectedImporters=new Set();
for(const file of manifests){
  const rel=path.dirname(file)===root?'.':path.relative(root,path.dirname(file)).replaceAll('\\','/');
  expectedImporters.add(rel);
  const importerMap=lock.get(rel);
  if(!importerMap){errors.push(`${rel}: missing importer`);continue}
  const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const sectionName of ['dependencies','devDependencies','optionalDependencies']){
    for(const [name,specifier] of Object.entries(manifest[sectionName]??{})){
      const actual=importerMap.get(`${sectionName}:${name}`);
      if(actual===undefined)errors.push(`${rel}: ${sectionName}.${name} missing from lock importer`);
      else if(String(actual)!==String(specifier))errors.push(`${rel}: ${sectionName}.${name} manifest=${specifier} lock=${actual}`);
    }
  }
  for(const [key] of importerMap){
    const [sectionName,...nameParts]=key.split(':');const name=nameParts.join(':');
    if(!(manifest[sectionName]??{})[name])errors.push(`${rel}: stale lock importer entry ${sectionName}.${name}`);
  }
}
for(const key of lock.keys())if(!expectedImporters.has(key))errors.push(`${key}: stale importer with no workspace manifest`);
if(errors.length){console.error(`pnpm lockfile is not synchronized:\n${errors.join('\n')}`);process.exit(1)}
console.log(`pnpm-lock.yaml synchronized with ${manifests.length} workspace/root manifests`);
