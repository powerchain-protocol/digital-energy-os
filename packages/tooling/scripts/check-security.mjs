import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const required=[
  ".github/dependabot.yml",
  ".github/SECURITY.md",
  ".github/workflows/security.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/dependency-review.yml",
  ".gitignore",
];
const errors=[];

for(const file of required){
  if(!fs.existsSync(path.join(root,file)))errors.push(`Missing security control: ${file}`);
}

const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const dependabot=read(".github/dependabot.yml");
for(const token of ["package-ecosystem: npm","package-ecosystem: github-actions","package-ecosystem: docker","interval: weekly"]){
  if(!dependabot.includes(token))errors.push(`Dependabot configuration missing: ${token}`);
}

const workflow=read(".github/workflows/security.yml");
for(const token of ["permissions:","contents: read","persist-credentials: false","pnpm install --frozen-lockfile","pnpm security:check","gitleaks/gitleaks-action@v2"]){
  if(!workflow.includes(token))errors.push(`Security workflow missing: ${token}`);
}

const codeql=read(".github/workflows/codeql.yml");
for(const token of ["security-events: write","javascript-typescript","github/codeql-action/analyze@v3"]){
  if(!codeql.includes(token))errors.push(`CodeQL workflow missing: ${token}`);
}

const readme=read("README.md");
for(const token of ["PowerChain | Digital Energy Infrastructure","**v1.0.0**","img.shields.io","Digital Energy Operating System"]){
  if(!readme.includes(token))errors.push(`README security/release header missing: ${token}`);
}

const ignore=read(".gitignore");
for(const token of [".env.*","!.env.example","*.pem","*.key",".secrets/"]){
  if(!ignore.includes(token))errors.push(`.gitignore credential rule missing: ${token}`);
}

const skippedDirs=new Set([".git","node_modules",".next","dist","coverage",".turbo"]);
const skippedExtensions=new Set([".png",".jpg",".jpeg",".gif",".webp",".ico",".icns",".woff",".woff2",".zip",".gz",".pdf"]);
const findings=[];
const patterns=[
  ["GitHub token",/(?:^|[^A-Za-z0-9_])(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})/g],
  ["Private key",/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ["AWS access key",/(?:^|[^A-Z0-9])(AKIA[0-9A-Z]{16})(?:[^A-Z0-9]|$)/g],
  ["Slack token",/(?:^|[^A-Za-z0-9])(xox[baprs]-[A-Za-z0-9-]{20,})/g],
];

function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(skippedDirs.has(entry.name))continue;
    const full=path.join(directory,entry.name);
    if(entry.isDirectory()){walk(full);continue}
    if(!entry.isFile()||skippedExtensions.has(path.extname(entry.name).toLowerCase()))continue;
    const stat=fs.statSync(full);
    if(stat.size>2_500_000)continue;
    let text;
    try{text=fs.readFileSync(full,"utf8")}catch{continue}
    if(text.includes("\u0000"))continue;
    for(const[label,pattern]of patterns){
      pattern.lastIndex=0;
      const match=pattern.exec(text);
      if(match){
        const before=text.slice(0,match.index);
        const line=before.split(/\r?\n/).length;
        findings.push(`${label}: ${path.relative(root,full)}:${line}`);
      }
    }
  }
}
walk(root);

if(findings.length)errors.push(...findings.map(item=>`Potential committed secret detected: ${item}`));

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Security policy, GitHub automation, README security header, and repository secret scan passed.");
