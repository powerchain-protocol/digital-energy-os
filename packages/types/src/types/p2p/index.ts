export type EnergySource = "solar" | "wind" | "hydro" | "battery" | "mixed";
export type ListingMode = "buy" | "sell" | "rent";
export type ListingStatus = "active" | "matched" | "paused" | "completed";
export type P2POrderStatus = "draft" | "requires_signature" | "escrowed" | "metering" | "settled" | "cancelled";

export interface LocalEnergyListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  mode: ListingMode;
  source: EnergySource;
  title: string;
  location: string;
  region: string;
  coordinates: { latitude: number; longitude: number };
  distanceKm: number;
  quantityKwh: number;
  availableKwh: number;
  minimumKwh: number;
  pricePerKwh: number;
  currency: "EUR" | "USD";
  deliveryStart: string;
  deliveryEnd: string;
  renewablePercent: number;
  verified: boolean;
  meterVerified: boolean;
  settlementAsset: "USDC" | "PWRC" | "FIAT";
  status: ListingStatus;
  rental?: {
    assetType: "battery" | "solar-share" | "ev-charger";
    billingPeriod: "hour" | "day" | "month";
    deposit: number;
    slotsAvailable: number;
  };
}

export interface P2POrderInput {
  listingId: string;
  buyerId: string;
  quantityKwh: number;
  walletAddress?: string;
}

export interface P2PMatch {
  listing: LocalEnergyListing;
  score: number;
  estimatedSavings: number;
  estimatedCarbonKg: number;
  deliveryConfidence: number;
}

export interface P2POrder {
  id: string;
  listingId: string;
  buyerId: string;
  quantityKwh: number;
  currency: "EUR" | "USD";
  settlementAsset: "USDC" | "PWRC" | "FIAT";
  status: P2POrderStatus;
  pricing: { subtotal: number; networkFee: number; escrowReserve: number; total: number };
  meterReadingId?: string;
  signature?: string;
  createdAt: string;
  expiresAt: string;
}

export interface EnergyCommunitySummary {
  members: number;
  producers: number;
  consumers: number;
  batteries: number;
  localSupplyKwh: number;
  localDemandKwh: number;
  matchedPercent: number;
  averagePrice: number;
  carbonAvoidedKg: number;
}
