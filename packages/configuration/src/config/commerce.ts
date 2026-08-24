export const COMMERCE_SERVICE_PORTS={
  checkout:3102,
  marketplace:3103,
  explorer:3106,
} as const;

export const COMMERCE_API={
  base:"/api/v1",
  explorer:"/api/v1/explorer",
  marketplace:"/api/v1/marketplace",
  checkout:"/api/v1/checkout",
  tokenization:"/api/v1/tokenization",
} as const;

export const COMMERCE_POLICY={
  idempotencyKeyMinLength:8,
  idempotencyKeyMaxLength:160,
  checkoutTtlMinutes:30,
  checkoutServiceFeeBps:250,
  maxCheckoutLines:20,
  maxMarketplaceInventory:1_000_000,
  walletSigning:"EXTERNAL_ONLY",
  tokenizationNetworks:["SOLANA","SUI"] as const,
  tokenizationStandard:"PET-20",
  canonicalEnergyUnit:"Wh",
} as const;
