import { commerceClient } from "../services/client";
export const commerceActions={
  reserveMarketplaceListing:commerceClient.createMarketplaceOrder,
  createCheckout:commerceClient.createCheckout,
  advanceCheckout:commerceClient.checkoutAction,
  resolveExplorer:commerceClient.resolveExplorer,
  createTokenizationIntent:commerceClient.createTokenization,
  advanceTokenization:commerceClient.tokenizationAction,
};
