import { energyAgentManifest,powerChainAgentTeam,permissionForLevel } from "@powerchain/control-plane";
import { withApi,apiJson } from "@/lib/api/with-api";
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson({version:"1.0.0",principle:"Wallets and authoritative execution systems remain outside direct AI authority.",agents:[energyAgentManifest,...powerChainAgentTeam],permissionLevels:[0,1,2,3,4,5].map(level=>({level,permissions:permissionForLevel(level as 0|1|2|3|4|5)}))},context))}
