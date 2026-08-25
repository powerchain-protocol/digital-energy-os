export const TOKEN_FRAMEWORK_VERSION="1.0.0" as const;

export const SOLANA_PROGRAM_IDS={
  system:"11111111111111111111111111111111",
  splToken:"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  token2022:"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  associatedToken:"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  computeBudget:"ComputeBudget111111111111111111111111111111",
  addressLookupTable:"AddressLookupTab1e1111111111111111111111111",
} as const;

export const METAPLEX_PROGRAM_IDS={
  tokenMetadata:"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  core:"CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
  bubblegumV2:"BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
  accountCompression:"cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
  noop:"noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
} as const;

export const PYTH_SOLANA_PROGRAM_IDS={
  receiver:"rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ",
  priceFeed:"pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT",
  pythPro:"pytd2yyk641x7ak7mkaasSJVXh6YYZnC7wTmtgAyxPt",
} as const;

export const JUPITER_PROGRAM_IDS={
  swapV6:"JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
  referral:"REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3",
  dca:"DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M",
  limitOrderV2:"j1o2qRpjcyUwEvwtcfhEQefh773ZgjxcVRry7LDqg5X",
} as const;

export const JUPITER_API={
  base:"https://api.jup.ag",
  tokenSearch:"/tokens/v2/search",
  tokenTag:"/tokens/v2/tag",
  tokenRecent:"/tokens/v2/recent",
  priceV3:"/price/v3",
  swapQuote:"/swap/v1/quote",
  swapBuild:"/swap/v1/swap",
} as const;

export const HELIUM_PROGRAM_IDS={
  circuitBreaker:"circAbx64bbsscPbQzZAUvuXpHqrCe6fLMzc2uKXz9g",
  dataCredits:"credMBJhYFzfn7NxBMdU4aUqFggAjgztaCcv2Fo6fPT",
  entityManager:"hemjuPXBpNvggtaUnN1MwT3wrdhttKEfosTcc2P9Pg8",
  subDaos:"hdaoVTCqhfHHo75XdAMxBKdUqvq1i5bF23sisBqVgGR",
  lazyDistributor:"1azyuavdMyvsivtNxPoz6SucD18eDHeXzFCUPq5XU7w",
  lazyTransactions:"1atrmQs3eq1N2FEYWu6tyTXbCjP4uQwExpjtnhXtS8h",
  treasuryManagement:"treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5",
  voterStakeRegistry:"hvsrNC3NKbcryqDs2DocYHZ9yPKEVzdSjQG6RVtK1s8",
} as const;
export const HELIUM_MINTS={HNT:"hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux",MOBILE:"mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6",IOT:"iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns",DC:"dcuc8Amr83Wz27ZkQ2K9NS6r8zRpf1J6cvArEBDZDmm"} as const;

export const SOLANA_MINTS={
  wrappedSol:"So11111111111111111111111111111111111111112",
  usdc:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

export type SolanaTokenStandard="SPL"|"TOKEN_2022";
export interface TokenMetadata{name:string;symbol:string;description:string;uri?:string;decimals:number}
export interface PowerChainTokenDefinition{id:"PWRC"|"PCT"|"CCT"|"ENERGY_CREDIT";version:"1.0.0";standard:SolanaTokenStandard|"SUI";purpose:string;metadata:TokenMetadata;programId?:string;mint?:string;deploymentState:"DEPLOYED"|"CONFIG_REQUIRED"|"PLANNED"}
export const CCT_TOKEN:PowerChainTokenDefinition={id:"CCT",version:"1.0.0",standard:"TOKEN_2022",purpose:"PowerChain Carbon Credit Token representing verified and traceable carbon attributes; issuance requires verified carbon evidence, compliance policy, approval, and retirement controls.",metadata:{name:"PowerChain Carbon Credit Token",symbol:"CCT",description:"Verified carbon attribute token",decimals:9},programId:SOLANA_PROGRAM_IDS.token2022,deploymentState:"CONFIG_REQUIRED"};
export interface TokenIssuanceIntent{id:string;organizationId:string;tokenId:PowerChainTokenDefinition["id"];amountRaw:bigint;recipient:string;evidenceIds:string[];metadataUri?:string;requiresApproval:true;network:"solana"|"sui";createdAt:string}
export function createTokenIssuanceIntent(input:Omit<TokenIssuanceIntent,"id"|"requiresApproval"|"createdAt">):TokenIssuanceIntent{if(input.amountRaw<=0n)throw new Error("Token issuance amount must be positive");if(!input.evidenceIds.length)throw new Error("Verified evidence is required for token issuance");return{id:`tki_${crypto.randomUUID()}`,...input,requiresApproval:true,createdAt:new Date().toISOString()}}
