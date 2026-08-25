import { startApplication } from "@powerchain/application-runtime";
import { application } from "./index.ts";
import { startAcpWorkerSupervisor } from "./acp/supervisor";

const supervisor=process.env.POWERCHAIN_ACP_ENABLED==="true"?startAcpWorkerSupervisor():null;
const runtime=startApplication(application,3108);
let stopping=false;
const shutdown=async()=>{if(stopping)return;stopping=true;supervisor?.stop();await runtime.close()};
process.once("SIGINT",()=>void shutdown());process.once("SIGTERM",()=>void shutdown());
