import { createApplication,json } from "@powerchain/application-runtime";
import { EMS_MODULES } from "@powerchain/ems";

const platformBase=(process.env.POWERCHAIN_PLATFORM_API_URL?.trim()||"http://127.0.0.1:3000").replace(/\/$/,"");
async function forward(request:Request,path:string){const target=new URL(path,platformBase);const source=new URL(request.url);source.searchParams.forEach((value,key)=>target.searchParams.append(key,value));const headers=new Headers();for(const name of ["authorization","cookie","content-type","idempotency-key","x-request-id","x-correlation-id","x-trace-id"]) {const value=request.headers.get(name);if(value)headers.set(name,value)}const body=["GET","HEAD"].includes(request.method)?undefined:await request.arrayBuffer();const response=await fetch(target,{method:request.method,headers,body:body?.byteLength?body:undefined,cache:"no-store"});return new Response(response.body,{status:response.status,headers:response.headers})}
export const emsApplication=createApplication({manifest:{id:"ems",name:"PowerChain Energy Management System",version:"1.0.0",description:"Company and operator EMS backed by the canonical PowerChain control plane and Energy Ledger.",basePath:"/api/v1",capabilities:EMS_MODULES},routes:[
 {method:"GET",path:"/api/v1/ems/modules",summary:"List canonical EMS capabilities",handler:()=>json({data:{version:"1.0.0",modules:EMS_MODULES}})},
 {method:"GET",path:"/api/v1/ems/summary",summary:"Read organization EMS state",handler:req=>forward(req,"/api/v1/ems/summary")},
 {method:"GET",path:"/api/v1/energy-network/search",summary:"Search energy participants",handler:req=>forward(req,"/api/v1/energy-network/search")},
 {method:"GET",path:"/api/v1/local-energy/listings",summary:"Read canonical integer-Wh Local Energy listings",handler:req=>forward(req,"/api/v1/local-energy/listings")},
 {method:"POST",path:"/api/v1/local-energy/listings",summary:"Create a canonical Local Energy listing",handler:req=>forward(req,"/api/v1/local-energy/listings")},
 {method:"POST",path:"/api/v1/local-energy/reservations",summary:"Create a compare-and-set Wh reservation",handler:req=>forward(req,"/api/v1/local-energy/reservations")}
],readiness:async()=>{try{const response=await fetch(`${platformBase}/api/v1/readiness`,{signal:AbortSignal.timeout(3000),cache:"no-store"});return response.ok}catch{return false}}});
