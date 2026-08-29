export const POWERCHAIN_ASSETS = [
  { symbol: "PWRC", name: "PowerChain", network: "solana", kind: "custom" },
  { symbol: "wPWRC", name: "Wrapped PowerChain", network: "solana", kind: "bridge" },
  { symbol: "CCT", name: "Carbon Credit Token", network: "solana", kind: "custom" },
  { symbol: "SOL", name: "Solana", network: "solana", kind: "token" },
  { symbol: "SUI", name: "Sui", network: "solana", kind: "token" },
  { symbol: "USDC", name: "USD Coin", network: "solana", kind: "token" }
] as const;

export const SUPPORTED_WALLETS = ["Phantom", "Solflare", "Backpack", "Glow"] as const;
export const SUPPORTED_NETWORKS = ["solana", "sui"] as const;
export type PowerChainAssetSymbol = (typeof POWERCHAIN_ASSETS)[number]["symbol"];
