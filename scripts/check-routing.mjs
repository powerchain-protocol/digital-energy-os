import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const failures=[];
if(fs.existsSync(path.join(root,"middleware.ts"))) failures.push("Deprecated root middleware.ts exists");
if(!fs.existsSync(path.join(root,"proxy.ts"))) failures.push("Root proxy.ts is missing");
if(fs.existsSync(path.join(root,"src/pages"))) failures.push("src/pages must not exist; use src/app only");
const required=["src/app/layout.tsx","src/app/providers.tsx","src/app/page.tsx","src/app/analytics/page.tsx","src/app/auth/signin/page.tsx","src/app/auth/signup/page.tsx","src/app/admin/users/page.tsx","src/app/api/v1/status/route.ts","src/workspaces/admin/components/user-management.tsx","src/components/wallet/wallet-connect-modal.tsx","src/lib/observability/tracing.ts","src/config/routes.ts","src/utils/helpers.ts","src/utils/assets.ts","src/utils/errors.ts","src/types/ai/ai.ts"];
for(const file of required) if(!fs.existsSync(path.join(root,file))) failures.push(`Missing ${file}`);
const sourceFiles=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);entry.isDirectory()?walk(file):sourceFiles.push(file)}}
walk(path.join(root,"src"));
for(const file of sourceFiles.filter(f=>/\.[jt]sx?$/.test(f))){const text=fs.readFileSync(file,"utf8");if(text.includes('next/router')) failures.push(`Legacy next/router import: ${path.relative(root,file)}`);}
const wallet=fs.readFileSync(path.join(root,"src/components/wallet/wallet-connect-modal.tsx"),"utf8");
if(!wallet.includes("@radix-ui/react-dialog")) failures.push("Wallet modal must use the approved Radix Dialog primitive");
if(failures.length){console.error(failures.join("\n"));process.exit(1);}console.log("App Router preflight passed");
