import type { TokenDetail } from "@/types/tokenomics";
export type TokenSymbol = "PWRC" | "CCT" | "SOL" | "SUI" | "USDC";
export const tokenDetails:Record<"pwrc"|"wpwrc"|"cct",TokenDetail>={
 pwrc:{symbol:"PWRC",name:"PowerChain Utility Token",purpose:"Utility, governance, network fees, staking and renewable-energy incentives.",network:"solana",decimals:9,initialPriceUsd:0.000002,utility:["Governance voting","Network and settlement fees","Staking and validator incentives","Energy marketplace rewards"],supply:"10,000,000,000 PWRC",contractLabel:"Solana Program / Mint" ,accent:"green"},
 wpwrc:{symbol:"wPWRC",name:"Wrapped PowerChain",purpose:"Cross-chain representation of PWRC for settlement and interoperability.",network:"cross-chain",decimals:9,initialPriceUsd:0.000002,utility:["Cross-chain settlement","Bridge liquidity","Marketplace collateral","Treasury routing"],supply:"Minted against locked PWRC",contractLabel:"Bridge Registry",accent:"blue"},
 cct:{symbol:"CCT",name:"Carbon Credit Token",purpose:"Verified carbon credits issued from renewable assets and audited emissions reductions.",network:"sui",decimals:6,initialPriceUsd:0.002,utility:["Carbon-credit trading","Credit retirement","ESG reporting","Project financing"],supply:"Issued against verified credits",contractLabel:"Carbon Registry",accent:"teal"}
};
