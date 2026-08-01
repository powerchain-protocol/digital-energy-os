import { NextResponse } from "next/server";
import { findLocalEnergyMatches } from "@/lib/p2p";
import type { EnergySource, ListingMode } from "@/types/p2p";
export async function GET(request:Request){const url=new URL(request.url);const mode=url.searchParams.get("mode") as ListingMode|null;const source=url.searchParams.get("source") as EnergySource|null;const maxDistanceKm=Number(url.searchParams.get("radius")||50);const quantityKwh=Number(url.searchParams.get("quantity")||0);return NextResponse.json({data:findLocalEnergyMatches({mode:mode??undefined,source:source??undefined,maxDistanceKm:Number.isFinite(maxDistanceKm)?maxDistanceKm:50,quantityKwh:quantityKwh>0?quantityKwh:undefined})});}
