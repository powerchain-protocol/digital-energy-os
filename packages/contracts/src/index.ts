export type ContractDomain =
  | "proof-of-energy"
  | "digital-twin"
  | "gridllm"
  | "pwrc-solana"
  | "marketplace"
  | "checkout"
  | "energy-tokenization";

export interface ContractDefinition{
  id:string;
  domain:ContractDomain;
  version:string;
  normativePath:string;
  implementationPath?:string;
}

export const contractRegistry:ContractDefinition[]=[
  {id:"PCC-PoE-001",domain:"proof-of-energy",version:"1.0.0",normativePath:"packages/contracts/specifications/m/proof-of-energy/README.md",implementationPath:"packages/programs/anchor/proof-of-energy/src/lib.rs"},
  {id:"PCC-DT-001",domain:"digital-twin",version:"1.0.0",normativePath:"packages/contracts/specifications/m/digital-twin/README.md",implementationPath:"packages/programs/anchor/src/digital_twin.rs"},
  {id:"PCC-AI-001",domain:"gridllm",version:"1.0.0",normativePath:"packages/contracts/specifications/m/gridllm/README.md",implementationPath:"packages/programs/anchor/src/gridllm.rs"},
  {id:"PCC-BRIDGE-001",domain:"pwrc-solana",version:"1.0.0",normativePath:"packages/contracts/specifications/m/pwrc-solana/contract.json",implementationPath:"packages/programs/anchor/pwrc-bridge/src/lib.rs"},
  {id:"PCC-MKT-001",domain:"marketplace",version:"1.0.0",normativePath:"packages/contracts/specifications/m/marketplace/contract.json",implementationPath:"packages/programs/anchor/marketplace/src/lib.rs"},
  {id:"PCC-CHK-001",domain:"checkout",version:"1.0.0",normativePath:"packages/contracts/specifications/m/checkout/contract.json",implementationPath:"packages/programs/anchor/escrow/src/lib.rs"},
  {id:"PCC-TOK-001",domain:"energy-tokenization",version:"1.0.0",normativePath:"packages/contracts/specifications/m/energy-tokenization/contract.json",implementationPath:"packages/programs/anchor/energy-token/src/lib.rs"},
];

export function requireContract(id:string):ContractDefinition{
  const contract=contractRegistry.find(item=>item.id===id);
  if(!contract)throw new Error(`Unknown PowerChain contract: ${id}`);
  return contract;
}
