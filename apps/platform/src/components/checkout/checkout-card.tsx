"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleAlert, ExternalLink, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckoutCurrency, CheckoutLineInput } from "@powerchain/checkout";
import { useCheckout } from "@/features/commerce/hooks/use-checkout";
import { minorToDecimal, statusLabel } from "@/features/commerce/utils";
import type { CheckoutSessionView } from "@/features/commerce/types";

const currencyAmount=(minor:string,currency:string)=>`${minorToDecimal(minor,6).toLocaleString("en-FI",{maximumFractionDigits:6})} ${currency}`;

export function CheckoutCard(){
  const params=useSearchParams();
  const preloaded=params.get("session");
  const[loaded,setLoaded]=useState<CheckoutSessionView|null>(null);
  const[asset,setAsset]=useState<CheckoutCurrency>("USDC");
  const[amount,setAmount]=useState("25");
  const[message,setMessage]=useState("Create or load a review-first checkout session.");
  const{session,busy,error,create,action}=useCheckout();
  const current=session??loaded;

  useEffect(()=>{
    if(!preloaded)return;
    void fetch(`/api/v1/checkout/sessions/${encodeURIComponent(preloaded)}`,{cache:"no-store"})
      .then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body?.error?.message??"Checkout session not found");setLoaded(body.data)})
      .catch(cause=>setMessage(cause instanceof Error?cause.message:"Checkout session not found"));
  },[preloaded]);

  async function createDirect(){
    const numeric=Number(amount);
    if(!Number.isFinite(numeric)||numeric<=0){setMessage("Enter a positive amount.");return}
    const line:CheckoutLineInput={id:"direct-payment",name:"PowerChain checkout",quantity:1,unitAmountMinor:BigInt(Math.round(numeric*1_000_000)).toString()};
    await create(asset,[line]);setLoaded(null);setMessage("Checkout created. Review the exact totals before requesting wallet approval.");
  }

  async function advance(){
    if(!current)return;
    try{
      if(current.status==="created"){await action("review");setLoaded(null);return}
      if(current.status==="review"){
        const wallet=window.prompt("Enter the payer wallet address. This does not sign anything.");
        if(!wallet?.trim())return;
        await action("signature-request",{payerWallet:wallet.trim()});setLoaded(null);return;
      }
      if(current.status==="pending_signature"){
        const signature=window.prompt("Paste the external wallet transaction signature/reference");
        if(!signature?.trim())return;
        await action("submit",{signature:signature.trim()});setLoaded(null);return;
      }
      if(current.status==="submitted"){
        const signature=current.settlementSignature??window.prompt("Paste the submitted signature again for confirmation");
        if(!signature?.trim())return;
        await action("confirm",{signature:signature.trim()});setLoaded(null);return;
      }
    }catch(cause){setMessage(cause instanceof Error?cause.message:"Checkout update failed")}
  }

  const next=current?current.status==="created"?"Review checkout":current.status==="review"?"Request wallet approval":current.status==="pending_signature"?"Record external signature":current.status==="submitted"?"Confirm verified settlement":null:null;

  return <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div><span className="eyebrow">NON-CUSTODIAL CHECKOUT</span><h2 className="mt-2 text-xl font-semibold">Review → wallet → verify</h2></div>{current&&<span className={`data-mode-chip ${current.status==="confirmed"?"live":"degraded"}`}>{statusLabel(current.status)}</span>}</div>
    {!current&&<div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm">Asset<select value={asset} onChange={event=>setAsset(event.target.value as CheckoutCurrency)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent p-3"><option>USDC</option><option>EURC</option><option>PWRC</option><option>SOL</option></select></label><label className="text-sm">Amount<input value={amount} onChange={event=>setAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-transparent p-3" inputMode="decimal"/></label><Button onClick={()=>void createDirect()} disabled={busy} className="sm:col-span-2">{busy?"Creating…":"Create checkout"}</Button></div>}

    {current&&<div className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Subtotal" value={currencyAmount(current.totals.subtotalMinor,current.currency)}/>
        <Info label="Service fee" value={currencyAmount(current.totals.serviceFeeMinor,current.currency)}/>
        <Info label="Total" value={currencyAmount(current.totals.totalMinor,current.currency)}/>
        <Info label="Expires" value={new Date(current.expiresAt).toLocaleTimeString()}/>
      </div>
      <div className="rounded-xl border border-emerald-700/15 bg-emerald-500/[.06] p-4 text-sm"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-700"/>PowerChain does not create wallet signatures in checkout. The external signature/reference is recorded only after the operator signs through their wallet.</div>
      {next&&<Button disabled={busy} onClick={()=>void advance()} className="w-full"><ArrowRight className="h-4 w-4"/>{busy?"Updating…":next}</Button>}
      {current.status==="confirmed"&&<div className="rounded-xl border border-emerald-700/20 bg-emerald-500/[.08] p-4 text-sm text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="mb-2 h-5 w-5"/>Settlement confirmed. Linked marketplace orders are reconciled automatically.</div>}
      {current.settlementSignature&&<a href={`/explorer?identifier=${encodeURIComponent(current.settlementSignature)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">Inspect transaction <ExternalLink className="h-4 w-4"/></a>}
    </div>}

    {(message||error)&&<p className="mt-4 text-xs text-[var(--muted)]">{error??message}</p>}
    <div className="mt-5 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-[var(--muted)]"><span>Review</span><span>Wallet</span><span>Submit</span><span>Confirm</span></div>
  </div>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.04]"><span className="text-xs text-[var(--muted)]">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>}
