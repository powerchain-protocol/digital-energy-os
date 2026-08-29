import {NextResponse}from"next/server";import{getPrices}from"@/lib/prices";export async function GET(){return NextResponse.json({data:await getPrices(["PWRC","CCT","SOL","SUI","USDC"])});}
