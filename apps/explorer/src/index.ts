import { ApplicationError, createApplication, json } from "@powerchain/application-runtime";
import { EXPLORER_NETWORKS, ExplorerError, resolveExplorerUrl, type ExplorerKind, type ExplorerNetwork } from "@powerchain/explorer";

export const applicationName="explorer" as const;

export const application=createApplication({
  manifest:{
    id:applicationName,
    name:"PowerChain Explorer",
    version:"1.0.0",
    description:"Canonical multi-network explorer resolver for Solana and Sui resources.",
    basePath:"/api/v1/explorer",
    capabilities:["solana","sui","transactions","addresses","tokens","programs","objects"],
  },
  routes:[
    {method:"GET",path:"/api/v1/explorer/networks",summary:"List supported explorer networks",handler:()=>json({data:Object.values(EXPLORER_NETWORKS)})},
    {method:"GET",path:"/api/v1/explorer/:network/:kind/:identifier",summary:"Resolve a canonical explorer URL",handler(_request,{params}){
      try{
        const network=params.network as ExplorerNetwork;
        const kind=params.kind as ExplorerKind;
        return json({network,kind,identifier:params.identifier,url:resolveExplorerUrl(network,kind,params.identifier),family:EXPLORER_NETWORKS[network]?.family});
      }catch(error){
        if(error instanceof ExplorerError)throw new ApplicationError(error.code,error.message,400);
        throw error;
      }
    }},
  ],
});
