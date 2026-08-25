import fs from 'node:fs';
const spec=fs.readFileSync('docs/api/swagger.yaml','utf8');
const required=[
  ['GET','/ems'],['GET','/erp'],['GET','/cmr'],['GET','/rewards'],['GET','/treasury'],['GET','/vault'],
  ['GET','/local-energy/listings'],['POST','/local-energy/listings'],['POST','/local-energy/reservations'],
  ['GET','/copilot/credits/rates'],['POST','/copilot/credits/quote'],
  ['GET','/solana/tokens/search'],['POST','/solana/swap/quote'],['GET','/solana/programs'],
  ['GET','/tokens/framework'],['POST','/tokens/cct/issuance-intents'],
  ['GET','/asset-graph'],['GET','/control-plane/agents/energy'],['POST','/control-plane/intents/evaluate'],['POST','/revenue/preview']
];
const lines=spec.split(/\r?\n/);const paths=new Map();let current=null;
for(const line of lines){let m;if((m=line.match(/^  (\/[^:]+):\s*$/))){current=m[1];paths.set(current,new Set());continue}if(current&&(m=line.match(/^    (get|post|put|patch|delete):\s*$/)))paths.get(current).add(m[1].toUpperCase())}
const errors=[];for(const [method,path] of required){if(!paths.get(path)?.has(method))errors.push(`${method} ${path}`)}
if(errors.length){console.error(`OpenAPI missing required methods:\n${errors.join('\n')}`);process.exit(1)}
const postman=JSON.parse(fs.readFileSync('docs/api/postman/PowerChain-v1.0.0.postman_collection.json','utf8'));
const serialized=JSON.stringify(postman);for(const [,path] of required){if(!serialized.includes(path))errors.push(`Postman ${path}`)}
if(errors.length){console.error(`Developer artifacts missing required operations:\n${errors.join('\n')}`);process.exit(1)}
console.log(`API developer artifacts cover ${required.length} canonical methods.`);
