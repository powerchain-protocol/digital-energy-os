"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commerceClient } from "@/features/commerce/services/client";
import { minorToDecimal } from "@/features/commerce/utils";
import type { MarketplaceListingView } from "@/features/commerce/types";

export function MarketplaceDetail({slug}:{slug:string}){
  const router=useRouter();
  const[listing,setListing]=useState<MarketplaceListingView|null>(null);
  const[quantity,setQuantity]=useState(1);
  const[error,setError]=useState<string|null>(null);
  const[busy,setBusy]=useState(false);

  useEffect(()=>{void fetch(`/api/v1/marketplace/listings/slug/${encodeURIComponent(slug)}`,{cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body?.error?.message??"Listing not found");setListing(body.data)}).catch(cause=>setError(cause instanceof Error?cause.message:"Listing not found"))},[slug]);

  async function checkout(){
    if(!listing||quantity<1||quantity>listing.remaining)return;
    setBusy(true);
    try{
      const order=(await commerceClient.createMarketplaceOrder(listing.id,quantity)).data;
      const session=(await commerceClient.createCheckout(listing.currency,[{id:order.id,name:listing.title,quantity:1,unitAmountMinor:order.amountMinor}])).data;
      const response=await fetch(`/api/v1/marketplace/orders/${encodeURIComponent(order.id)}/checkout`,{method:"POST",headers:{"content-type":"application/json","Idempotency-Key":`attach-${crypto.randomUUID()}`},body:JSON.stringify({checkoutSessionId:session.id})});
      if(!response.ok){const body=await response.json();throw new Error(body?.error?.message??"Unable to attach checkout")}
      router.push(`/checkout?session=${encodeURIComponent(session.id)}&order=${encodeURIComponent(order.id)}`);
    }catch(cause){setError(cause instanceof Error?cause.message:"Unable to create order")}
    finally{setBusy(false)}
  }

  if(error)return <div className="content-container"><div className="digital-energy-error"><span>{error}</span></div></div>;
  if(!listing)return <div className="content-container">Loading marketplace listing…</div>;
  return <div className="content-container space-y-5">
    <button className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800" onClick={()=>router.push("/marketplace")}><ArrowLeft className="h-4 w-4"/>Marketplace</button>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel p-6">
        <span className="eyebrow">{listing.category} · {listing.source??"POWERCHAIN"}</span>
        <h1 className="mt-3 text-3xl font-semibold">{listing.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{listing.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><Stat label="Price" value={`${minorToDecimal(listing.unitAmountMinor,6).toLocaleString("en-FI",{maximumFractionDigits:6})} ${listing.currency}`}/><Stat label="Remaining" value={String(listing.remaining)}/><Stat label="Location" value={listing.location??"—"}/></div>
        <div className="mt-5 rounded-xl border border-emerald-700/15 bg-emerald-500/[.06] p-4 text-sm"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-700"/>Inventory is reserved atomically before checkout. Payment confirmation remains a separate lifecycle.</div>
      </section>
      <aside className="panel p-6">
        <h2 className="font-semibold">Create reservation</h2>
        <label className="mt-5 block text-sm font-semibold">Quantity<input type="number" min={1} max={listing.remaining} value={quantity} onChange={event=>setQuantity(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/></label>
        <Button onClick={()=>void checkout()} disabled={busy||quantity<1||quantity>listing.remaining} className="mt-5 w-full"><ShoppingCart className="h-4 w-4"/>{busy?"Reserving…":"Reserve & checkout"}</Button>
      </aside>
    </div>
  </div>
}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>}
