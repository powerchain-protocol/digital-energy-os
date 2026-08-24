import fs from "node:fs";

const lock=fs.readFileSync("pnpm-lock.yaml","utf8");
const workspace=fs.readFileSync("pnpm-workspace.yaml","utf8");
const errors=[];

const blocked=[
  ["deepmerge-ts@7.1.5","CVE-2026-40345 / GHSA-ggr8-5vv4-36mx"],
  ["image-size@2.0.2","ICNS/JXL/HEIF infinite-loop advisories"],
  ["elliptic@6.6.1","CVE-2025-14505 / GHSA-848j-6mx2-7j84"],
  ["postcss@8.4.31","PostCSS source-map disclosure/XSS advisories"],
  ["sharp@0.34.5","libvips CVE chain"],
  ["uuid@8.3.2","CVE-2026-41907 / GHSA-w5hq-g745-h8pq"],
  ["uuid@9.0.1","CVE-2026-41907 / GHSA-w5hq-g745-h8pq"],
  ["@storybook/nextjs@10.5.10","Unfixed image-size and browser crypto polyfill dependency chain"],
];

for(const[token,reason]of blocked){
  if(lock.includes(token))errors.push(`Blocked dependency remains in pnpm-lock.yaml: ${token} (${reason})`);
}

for(const token of ["postcss@8.5.26","deepmerge-ts@8.0.2","uuid@11.1.1"]){
  if(!lock.includes(token))errors.push(`Expected remediated dependency is missing: ${token}`);
}

for(const token of [
  "next@16.2.12>postcss: 8.5.26",
  "next@16.2.12>sharp: '-'",
  "'@prisma/config@6.19.3>deepmerge-ts': 8.0.2",
  "jayson@4.3.0>uuid: 11.1.1",
  "'@cetusprotocol/cetus-sui-clmm-sdk@5.4.0>uuid': 11.1.1",
]){
  if(!workspace.includes(token))errors.push(`pnpm-workspace security override missing: ${token}`);
}

if(!workspace.includes("minimumReleaseAge: 1440"))errors.push("pnpm minimumReleaseAge must remain 1440 minutes");
if(lock.includes("sharp@"))errors.push("sharp should not be resolved while Next local image optimization is disabled");
if(lock.includes("image-size@"))errors.push("image-size should not remain in the resolved dependency graph");
if(lock.includes("elliptic@"))errors.push("elliptic should not remain in the resolved dependency graph");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Dependency advisory regression check passed.");
