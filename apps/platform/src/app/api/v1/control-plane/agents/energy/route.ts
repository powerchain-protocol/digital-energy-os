import { CONTROL_PLANE_VERSION,energyAgentManifest,permissionForLevel } from "@powerchain/control-plane";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson({version:CONTROL_PLANE_VERSION,manifest:energyAgentManifest,permissionsByLevel:[0,1,2,3,4,5].map(level=>({level,permissions:permissionForLevel(level as 0|1|2|3|4|5)})),authority:{walletSigning:false,directTreasury:false,directRwaMutation:false}},context))}
