import { COMMERCE_API, COMMERCE_POLICY, COMMERCE_SERVICE_PORTS } from "@powerchain/configuration";

export const COMMERCE_CONFIG={
  apiBase:COMMERCE_API.base,
  marketplaceBase:COMMERCE_API.marketplace,
  checkoutBase:COMMERCE_API.checkout,
  explorerBase:COMMERCE_API.explorer,
  tokenizationBase:COMMERCE_API.tokenization,
  maxListingInventory:COMMERCE_POLICY.maxMarketplaceInventory,
  maxCheckoutLines:COMMERCE_POLICY.maxCheckoutLines,
  checkoutTtlMinutes:COMMERCE_POLICY.checkoutTtlMinutes,
  idempotencyKeyMinLength:COMMERCE_POLICY.idempotencyKeyMinLength,
  idempotencyKeyMaxLength:COMMERCE_POLICY.idempotencyKeyMaxLength,
  walletSigning:COMMERCE_POLICY.walletSigning,
  servicePorts:COMMERCE_SERVICE_PORTS,
} as const;
