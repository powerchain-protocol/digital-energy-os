import { Suspense } from "react";
import { Shell } from "@/components/shell";
import { CheckoutCard } from "@/components/checkout/checkout-card";

export default function CheckoutPage(){
  return <Shell><div className="content-container grid gap-5 lg:grid-cols-[minmax(0,1fr)_28rem]">
    <section className="rounded-[26px] bg-gradient-to-br from-[#050807] via-[#073f31] to-[#0f6a52] p-7 text-white">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-200">PowerChain Checkout · v1.0.0</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">Review exact economics before external wallet authorization.</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">Checkout is separated into session creation, review, wallet approval request, external signature submission, and verified confirmation. Marketplace inventory remains reserved while checkout is pending.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><Principle title="Non-custodial" text="Wallet remains external."/><Principle title="Idempotent" text="Economic creation is retry-safe."/><Principle title="Reconciled" text="Confirmed checkout updates linked orders."/></div>
    </section>
    <Suspense fallback={<div className="rounded-[24px] border p-6">Loading checkout…</div>}><CheckoutCard/></Suspense>
  </div></Shell>
}
function Principle({title,text}:{title:string;text:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><strong className="text-sm">{title}</strong><span className="mt-1 block text-xs text-white/60">{text}</span></div>}
