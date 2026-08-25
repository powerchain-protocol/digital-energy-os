import { createServer } from "node:http";
import { EMS_MODULES } from "@powerchain/ems";
const port=Number(process.env.EMS_PORT??3011);
const server=createServer((req,res)=>{if(req.url==="/health"){res.writeHead(200,{"content-type":"application/json"});return res.end(JSON.stringify({service:"powerchain-ems",version:"1.0.0",state:"READY"}))}if(req.url==="/api/v1/ems/modules"){res.writeHead(200,{"content-type":"application/json"});return res.end(JSON.stringify({data:{version:"1.0.0",modules:EMS_MODULES}}))}res.writeHead(404,{"content-type":"application/json"});res.end(JSON.stringify({error:{code:"NOT_FOUND",message:"Route not found"}}))});
server.listen(port,"127.0.0.1",()=>console.log(JSON.stringify({event:"ems.ready",port,version:"1.0.0"})));
for(const sig of ["SIGINT","SIGTERM"] as const)process.on(sig,()=>server.close(()=>process.exit(0)));
