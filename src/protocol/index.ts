export type ChainProtocol = "solana" | "sui";
export type TokenIdentity = { chain: ChainProtocol; address: string; symbol: string; decimals: number };
export const POWERCHAIN_PROTOCOL = { name: "PowerChain Protocol", version: "1.0.0-beta", tokens: { PWRC: { chain: "solana", address: process.env.NEXT_PUBLIC_PWRC_MINT ?? "", symbol: "PWRC", decimals: 9 }, CCT: { chain: "solana", address: process.env.NEXT_PUBLIC_CCT_MINT ?? "", symbol: "CCT", decimals: 6 } } } as const;
