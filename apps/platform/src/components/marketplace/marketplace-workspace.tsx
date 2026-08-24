"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Filter, Leaf, Search, ShieldCheck, ShoppingCart, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketplace } from "@/features/commerce/hooks/use-marketplace";
import { commerceClient } from "@/features/commerce/services/client";
import { minorToDecimal, statusLabel } from "@/features/commerce/utils";
import { useCommerceContext } from "@/features/commerce/context/commerce-context";
import type { MarketplaceListingView } from "@/features/commerce/types";

const money=(minor:string,currency:string)=>new Intl.NumberFormat("en-FI",{style:"currency",currency:currency==="USDC"||currency==="EURC"?"EUR":"USD",maximumFractionDigits:4}).format(minorToDecimal(minor,6));

export function MarketplaceWorkspace(){
  const router=useRouter();
  const{setSelectedListingId,setCheckoutSessionId}=useCommerceContext();
  const[query,setQuery]=useState("");
  const[source,setSource]=useState("All");
  const[selected,setSelected]=useState<MarketplaceListingView|null>(null);
  const[quantity,setQuantity]=useState(1);
  const[busy,setBusy]=useState(false);
  const[notice,setNotice]=useState<string|null>(null);
  const{listings,loading,error,dataMode,refresh}=useMarketplace(query);

  const sources=useMemo(()=>["All",...Array.from(new Set(listings.map(item=>item.source).filter(Boolean) as string[]))],[listings]);
  const filtered=useMemo(()=>listings.filter(item=>source==="All"||item.source===source),[listings,source]);

  async function reserveAndCheckout(){
    if(!selected||quantity<1||quantity>selected.remaining)return;
    setBusy(true);setNotice(null);
    try{
      const orderBody=await commerceClient.createMarketplaceOrder(selected.id,quantity);
      const order=orderBody.data;
      const checkoutBody=await commerceClient.createCheckout(selected.currency,[{
        id:order.id,
        name:selected.title,
        quantity:1,
        unitAmountMinor:order.amountMinor,
      }]);
      const checkout=checkoutBody.data;
      await fetch(`/api/v1/marketplace/orders/${encodeURIComponent(order.id)}/checkout`,{
        method:"POST",
        headers:{"content-type":"application/json","Idempotency-Key":`attach-${crypto.randomUUID()}`},
        body:JSON.stringify({checkoutSessionId:checkout.id}),
      }).then(async response=>{if(!response.ok){const body=await response.json();throw new Error(body?.error?.message??"Unable to attach checkout")}});
      setSelectedListingId(selected.id);setCheckoutSessionId(checkout.id);
      router.push(`/checkout?session=${encodeURIComponent(checkout.id)}&order=${encodeURIComponent(order.id)}`);
    }catch(cause){
      setNotice(cause instanceof Error?cause.message:"Unable to reserve marketplace inventory");
    }finally{setBusy(false)}
  }

  return <div className="content-container space-y-6">
    <section className="market-hero">
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2"><span className="data-mode-chip live">POWERCHAIN MARKETPLACE</span><span className={`data-mode-chip ${dataMode==="LIVE"?"live":"degraded"}`}>{dataMode}</span></div>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Discover verified energy assets, reserve inventory, and move into controlled checkout.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Listings, inventory reservation, checkout linkage and final payment state are separated so the marketplace cannot silently convert discovery into settlement.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-emerald-50/75"><span className="rounded-full border border-white/15 px-3 py-1.5">Atomic inventory</span><span className="rounded-full border border-white/15 px-3 py-1.5">Idempotent orders</span><span className="rounded-full border border-white/15 px-3 py-1.5">External wallet approval</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Kpi label="Active listings" value={String(filtered.length)}/>
          <Kpi label="Inventory" value={String(filtered.reduce((sum,item)=>sum+item.remaining,0))}/>
          <Kpi label="Sources" value={String(Math.max(0,sources.length-1))}/>
          <Kpi label="Settlement" value="Review-first"/>
        </div>
      </div>
    </section>

    <section className="panel flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <label className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border)] px-3"><Search className="h-4 w-4 text-[var(--muted)]"/><input value={query} onChange={event=>setQuery(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search energy, assets, location, source"/></label>
      <div className="flex flex-wrap gap-2">{sources.map(item=><button key={item} onClick={()=>setSource(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${source===item?"bg-emerald-900 text-white":"border border-[var(--border)]"}`}>{item}</button>)}</div>
      <Button variant="framed" onClick={()=>void refresh()}><Filter className="h-4 w-4"/>Refresh</Button>
    </section>

    {error&&<div className="digital-energy-error"><Activity/><div><strong>Marketplace unavailable</strong><span>{error}</span></div></div>}
    {notice&&<div className="digital-energy-error"><Activity/><div><strong>Marketplace action</strong><span>{notice}</span></div></div>}

    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map(item=><MarketplaceCard key={item.id} listing={item} onReview={()=>{setSelected(item);setQuantity(1)}}/>)}
      {!loading&&!filtered.length&&<div className="col-span-full rounded-2xl border border-dashed p-12 text-center text-sm text-[var(--muted)]">No active marketplace listings match this query.</div>}
    </section>

    {selected&&<div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}>
      <section className="w-full max-w-xl rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><span className="eyebrow">MARKETPLACE ORDER REVIEW</span><h2 className="mt-2 text-2xl font-semibold">{selected.title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{selected.description}</p></div><button onClick={()=>setSelected(null)} className="text-sm font-bold">Close</button></div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-black/[.03] p-4 dark:bg-white/[.04]">
          <OrderLine label="Unit price" value={`${money(selected.unitAmountMinor,selected.currency)} · ${selected.currency}`}/>
          <OrderLine label="Available" value={String(selected.remaining)}/>
          <OrderLine label="Status" value={statusLabel(selected.status)}/>
          <OrderLine label="Source" value={selected.source??selected.category}/>
        </div>
        <label className="mt-5 block text-sm font-semibold">Quantity<input type="number" min={1} max={selected.remaining} value={quantity} onChange={event=>setQuantity(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/></label>
        <div className="mt-5 rounded-xl border border-emerald-700/15 bg-emerald-500/[.06] p-4 text-sm"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-700"/>Reservation is atomic. Checkout is created separately. Wallet submission remains explicit and external.</div>
        <Button onClick={()=>void reserveAndCheckout()} disabled={busy||quantity<1||quantity>selected.remaining} className="mt-5 w-full"><ShoppingCart className="h-4 w-4"/>{busy?"Reserving…":"Reserve inventory & open checkout"}</Button>
      </section>
    </div>}
  </div>;
}

function MarketplaceCard({listing,onReview}:{listing:MarketplaceListingView;onReview:()=>void}){
  const verified=Boolean(listing.metadata?.verified);
  const carbon=Number(listing.metadata?.carbonIntensity??0);
  return <article className="market-card overflow-hidden">
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-5 text-white">
      <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">{listing.source??listing.category}</span><span className="text-xs text-white/65">{listing.currency}</span></div>
      <h2 className="mt-10 text-xl font-semibold">{listing.title}</h2>
      <p className="mt-2 text-sm text-white/70">{listing.location??"PowerChain marketplace"}</p>
    </div>
    <div className="p-5">
      <p className="line-clamp-2 text-sm text-[var(--muted)]">{listing.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Price" value={money(listing.unitAmountMinor,listing.currency)}/><Metric label="Remaining" value={String(listing.remaining)}/></div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">{verified&&<span className="inline-flex items-center gap-1 text-emerald-700"><ShieldCheck className="h-4 w-4"/>Verified</span>}{carbon>0&&<span className="inline-flex items-center gap-1 text-emerald-700"><Leaf className="h-4 w-4"/>{carbon} gCO₂/kWh</span>}</div>
      <Button onClick={onReview} className="mt-5 w-full"><Zap className="h-4 w-4"/>Review order</Button>
    </div>
  </article>;
}
function Kpi({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/15 bg-white/[.08] p-4 backdrop-blur"><span className="text-[11px] uppercase tracking-wider text-white/60">{label}</span><strong className="mt-2 block text-xl">{value}</strong></div>}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.04]"><span className="text-[11px] text-[var(--muted)]">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>}
function OrderLine({label,value}:{label:string;value:string}){return <div><span className="text-xs text-[var(--muted)]">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>}
