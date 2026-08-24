export const EXPLORER_VERSION="1.0.0" as const;
export type ExplorerNetwork="solana-devnet"|"solana-mainnet-beta"|"sui-devnet"|"sui-testnet"|"sui-mainnet";
export type ExplorerKind="transaction"|"address"|"token"|"program"|"object";
export type ExplorerFamily="SOLANA"|"SUI";

export interface ExplorerNetworkConfig{
  id:ExplorerNetwork;
  family:ExplorerFamily;
  label:string;
  chainId:string;
  baseUrl:string;
  enabled:boolean;
  kinds:readonly ExplorerKind[];
}

export const EXPLORER_NETWORKS:Record<ExplorerNetwork,ExplorerNetworkConfig>={
  "solana-devnet":{id:"solana-devnet",family:"SOLANA",label:"Solana Devnet",chainId:"solana:devnet",baseUrl:"https://explorer.solana.com",enabled:true,kinds:["transaction","address","token","program"]},
  "solana-mainnet-beta":{id:"solana-mainnet-beta",family:"SOLANA",label:"Solana Mainnet",chainId:"solana:mainnet-beta",baseUrl:"https://solscan.io",enabled:true,kinds:["transaction","address","token","program"]},
  "sui-devnet":{id:"sui-devnet",family:"SUI",label:"Sui Devnet",chainId:"sui:devnet",baseUrl:"https://suiscan.xyz/devnet",enabled:true,kinds:["transaction","address","object"]},
  "sui-testnet":{id:"sui-testnet",family:"SUI",label:"Sui Testnet",chainId:"sui:testnet",baseUrl:"https://suiscan.xyz/testnet",enabled:true,kinds:["transaction","address","object"]},
  "sui-mainnet":{id:"sui-mainnet",family:"SUI",label:"Sui Mainnet",chainId:"sui:mainnet",baseUrl:"https://suiscan.xyz/mainnet",enabled:true,kinds:["transaction","address","object"]},
};

export class ExplorerError extends Error{
  constructor(readonly code:string,message:string){super(message);this.name="ExplorerError"}
}

export function normalizeExplorerIdentifier(value:string){
  const normalized=value.trim();
  if(normalized.length<16||normalized.length>256)throw new ExplorerError("EXPLORER_IDENTIFIER_INVALID","Explorer identifier must be 16–256 characters");
  if(/\s/.test(normalized))throw new ExplorerError("EXPLORER_IDENTIFIER_INVALID","Explorer identifier cannot contain whitespace");
  return normalized;
}

export function resolveExplorerUrl(networkId:ExplorerNetwork,kind:ExplorerKind,identifier:string){
  const network=EXPLORER_NETWORKS[networkId];
  if(!network||!network.enabled)throw new ExplorerError("EXPLORER_NETWORK_UNAVAILABLE","Explorer network is unavailable");
  if(!network.kinds.includes(kind))throw new ExplorerError("EXPLORER_KIND_UNSUPPORTED",`${kind} is not supported on ${network.label}`);
  const value=encodeURIComponent(normalizeExplorerIdentifier(identifier));
  if(network.family==="SOLANA"){
    if(network.id==="solana-devnet"){
      const segment=kind==="transaction"?"tx":kind==="token"?"address":kind==="program"?"address":"address";
      return `${network.baseUrl}/${segment}/${value}?cluster=devnet`;
    }
    const segment=kind==="transaction"?"tx":kind==="token"?"token":kind==="program"?"account":"account";
    return `${network.baseUrl}/${segment}/${value}`;
  }
  const segment=kind==="transaction"?"tx":kind==="object"?"object":"account";
  return `${network.baseUrl}/${segment}/${value}`;
}

export function classifyExplorerInput(value:string):ExplorerKind[]{
  const normalized=normalizeExplorerIdentifier(value);
  if(normalized.startsWith("0x"))return["object","address"];
  if(normalized.length>72)return["transaction"];
  return["address","token","program"];
}
