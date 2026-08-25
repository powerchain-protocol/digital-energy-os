import { startApplication } from "@powerchain/application-runtime";
import { application } from "./index.ts";
import { startAcpAdapter,stopAcpAdapter } from "./acp-runtime.ts";

let stopping=false;
async function main(){
  if(process.env.POWERCHAIN_ACP_ENABLED==="true"&&process.env.POWERCHAIN_ACP_MODE!=="disabled"){
    try{await startAcpAdapter()}catch(error){if(process.env.POWERCHAIN_ACP_MODE==="live")throw error;process.stderr.write(`[acp-adapter] degraded: ${error instanceof Error?error.message:String(error)}\n`)}
  }
  const runtime=startApplication(application,3105);
  const shutdown=async()=>{if(stopping)return;stopping=true;await stopAcpAdapter().catch(()=>undefined);await runtime.close()};
  process.once("SIGINT",()=>void shutdown());process.once("SIGTERM",()=>void shutdown());
}
void main().catch(error=>{process.stderr.write(`${error instanceof Error?error.stack??error.message:String(error)}\n`);process.exitCode=1});
