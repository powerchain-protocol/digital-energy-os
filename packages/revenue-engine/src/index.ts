export const REVENUE_ENGINE_VERSION="1.0.0" as const;
export type RevenueSource="PPA"|"GRID_EXPORT"|"ENERGY_MARKETPLACE"|"INCENTIVE"|"CARBON_ATTRIBUTE";
export interface MoneyMinor{currency:string;minorUnits:bigint;scale:number}
export interface RevenueInput{source:RevenueSource;energyWh:bigint;rateMinorPerKwh:bigint;currency:string;scale:number}
export interface RevenueLine{source:RevenueSource;energyWh:bigint;gross:MoneyMinor}
export interface RevenueAllocation{treasury:MoneyMinor;investor:MoneyMinor;assetReserve:MoneyMinor}
export function calculateRevenue(input:RevenueInput):RevenueLine{if(input.energyWh<0n||input.rateMinorPerKwh<0n)throw new Error("Revenue inputs must be non-negative");const gross=(input.energyWh*input.rateMinorPerKwh)/1000n;return{source:input.source,energyWh:input.energyWh,gross:{currency:input.currency,minorUnits:gross,scale:input.scale}}}
export function allocateRevenue(amount:MoneyMinor,shares:{treasuryBps:number;investorBps:number;reserveBps:number}):RevenueAllocation{const total=shares.treasuryBps+shares.investorBps+shares.reserveBps;if(total!==10_000)throw new Error("Revenue allocation basis points must total 10,000");const treasury=amount.minorUnits*BigInt(shares.treasuryBps)/10_000n;const investor=amount.minorUnits*BigInt(shares.investorBps)/10_000n;const assetReserve=amount.minorUnits-treasury-investor;return{treasury:{...amount,minorUnits:treasury},investor:{...amount,minorUnits:investor},assetReserve:{...amount,minorUnits:assetReserve}}}
