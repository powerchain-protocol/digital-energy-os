export const LOCAL_ENERGY_VERSION="1.0.0" as const;
export type LocalEnergyListingMode="BUY"|"SELL"|"RENT";
export type LocalEnergyLifecycle="REVIEW_REQUIRED"|"RESERVED"|"DELIVERING"|"DELIVERED"|"RECONCILED"|"SETTLEMENT_READY"|"SETTLED"|"DISPUTED"|"CANCELLED";
export interface LocalEnergyListing{ id:string;organizationId:string;participantId:string;mode:LocalEnergyListingMode;source:string;quantityWh:bigint;availableWh:bigint;priceMinorPerKwh:bigint;currency:string;deliveryStart:string;deliveryEnd:string;version:number;state:"ACTIVE"|"PAUSED"|"CLOSED" }
export interface LocalEnergyReservation{ id:string;listingId:string;organizationId:string;quantityWh:bigint;listingVersion:number;state:LocalEnergyLifecycle;createdAt:string }
export function assertReservable(listing:LocalEnergyListing,quantityWh:bigint,expectedVersion:number){if(listing.state!=="ACTIVE")throw new Error("LOCAL_ENERGY_LISTING_NOT_ACTIVE");if(listing.version!==expectedVersion)throw new Error("LOCAL_ENERGY_VERSION_CONFLICT");if(quantityWh<=0n||quantityWh>listing.availableWh)throw new Error("LOCAL_ENERGY_INSUFFICIENT_AVAILABLE_WH")}
export function quoteListing(listing:LocalEnergyListing,quantityWh:bigint){assertReservable(listing,quantityWh,listing.version);return{currency:listing.currency,minorUnits:(quantityWh*listing.priceMinorPerKwh)/1000n,quantityWh}}
