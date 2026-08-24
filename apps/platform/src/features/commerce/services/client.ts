import type { CheckoutCurrency, CheckoutLineInput } from "@powerchain/checkout";
import type { ExplorerKind, ExplorerNetwork } from "@powerchain/explorer";
import type { TokenizationNetwork } from "@powerchain/tokenization";
import type { CheckoutSessionView, CommerceApiEnvelope, ExplorerResolution, MarketplaceListingView, MarketplaceOrderView, TokenizationIntentView } from "../types";
import { createIdempotencyKey } from "../utils";

async function api<T>(url:string,init?:RequestInit){
  const response=await fetch(url,{cache:"no-store",...init});
  const body=await response.json();
  if(!response.ok)throw new Error(body?.error?.message??body?.error??`Request failed (${response.status})`);
  return body as CommerceApiEnvelope<T>;
}

export const commerceClient={
  listMarketplace:(query="")=>api<MarketplaceListingView[]>(`/api/v1/marketplace/listings?q=${encodeURIComponent(query)}`),
  createMarketplaceOrder:(listingId:string,quantity:number)=>api<MarketplaceOrderView>("/api/v1/marketplace/orders",{
    method:"POST",headers:{"content-type":"application/json","Idempotency-Key":createIdempotencyKey("market-order")},
    body:JSON.stringify({listingId,quantity}),
  }),
  createCheckout:(currency:CheckoutCurrency,lines:CheckoutLineInput[])=>api<CheckoutSessionView>("/api/v1/checkout/sessions",{
    method:"POST",headers:{"content-type":"application/json","Idempotency-Key":createIdempotencyKey("checkout")},
    body:JSON.stringify({currency,lines}),
  }),
  checkoutAction:(id:string,action:"review"|"signature-request"|"submit"|"confirm"|"cancel",payload:Record<string,unknown>={})=>api<CheckoutSessionView>(`/api/v1/checkout/sessions/${encodeURIComponent(id)}/${action}`,{
    method:"POST",headers:{"content-type":"application/json","Idempotency-Key":createIdempotencyKey(`checkout-${action}`)},body:JSON.stringify(payload),
  }),
  explorerNetworks:()=>api<unknown[]>("/api/v1/explorer/networks"),
  resolveExplorer:(network:ExplorerNetwork,kind:ExplorerKind,identifier:string)=>api<ExplorerResolution>("/api/v1/explorer/resolve",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({network,kind,identifier}),
  }),
  listTokenization:()=>api<TokenizationIntentView[]>("/api/v1/tokenization/intents"),
  createTokenization:(input:{energyPositionId:string;network:TokenizationNetwork;amountWh:string})=>api<TokenizationIntentView>("/api/v1/tokenization/intents",{
    method:"POST",headers:{"content-type":"application/json","Idempotency-Key":createIdempotencyKey("tokenize")},body:JSON.stringify(input),
  }),
  tokenizationAction:(id:string,action:string,payload:Record<string,unknown>={})=>api<TokenizationIntentView>(`/api/v1/tokenization/intents/${encodeURIComponent(id)}/${action}`,{
    method:"POST",headers:{"content-type":"application/json","Idempotency-Key":createIdempotencyKey(`tokenize-${action}`)},body:JSON.stringify(payload),
  }),
};
