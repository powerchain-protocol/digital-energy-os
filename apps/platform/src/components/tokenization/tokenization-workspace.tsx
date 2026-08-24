"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Coins, Database, ExternalLink, LockKeyhole, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import type { TokenizationNetwork } from "@powerchain/tokenization";
import { commerceClient } from "@/features/commerce/services/client";
import { useTokenization } from "@/features/commerce/hooks/use-tokenization";
import { statusLabel } from "@/features/commerce/utils";

type Position={id:string;amountWh:string;state:string;source:string;gridAreaId?:string};
type Intent=Awaited<ReturnType<typeof commerceClient.createTokenization>>["data"];

export function TokenizationWorkspace(){
  const[positions,setPositions]=useState<Position[]>([]);
  const[positionId,setPositionId]=useState("");
  const[network,setNetwork]=useState<TokenizationNetwork>("SOLANA");
  const[amountWh,setAmountWh]=useState("1000");
  const[busy,setBusy]=useState<string|null>(null);
  const[notice,setNotice]=useState<string|null>(null);
  const{intents,loading,error,refresh}=useTokenization();

  const loadPositions=useCallback(async()=>{
    const response=await fetch("/api/v1/digital-energy/overview",{cache:"no-store"});
    const body=await response.json();
    if(response.ok){
      const data=(body.data?.positions??[]) as Position[];
      setPositions(data);
      if(!positionId&&data[0])setPositionId(data[0].id);
    }
  },[positionId]);
  useEffect(()=>{void loadPositions()},[loadPositions]);

  async function create(){
    if(!positionId||!amountWh.match(/^\d+$/)||BigInt(amountWh)<=0n)return;
    setBusy("create");setNotice(null);
    try{
      await commerceClient.createTokenization({energyPositionId:positionId,network,amountWh});
      await refresh();setNotice("Tokenization draft created. Review and approve before any wallet step.");
    }catch(cause){setNotice(cause instanceof Error?cause.message:"Tokenization failed")}
    finally{setBusy(null)}
  }

  async function advance(intent:Intent){
    const state=intent.state;
    let action:string|null=null;let payload:Record<string,unknown>={};
    if(state==="DRAFT")action="review";
    else if(state==="REVIEW_REQUIRED")action="approve";
    else if(state==="APPROVED")action="wallet";
    else if(state==="AWAITING_WALLET"){
      const walletReference=window.prompt("Paste the external wallet transaction/signature reference after signing outside PowerChain Copilot.");
      if(!walletReference?.trim())return;action="submit";payload={walletReference:walletReference.trim()};
    }else if(state==="SUBMITTED"){
      const chainReference=window.prompt("Paste the confirmed on-chain representation reference (mint/object/token account).");
      if(!chainReference?.trim())return;action="confirm";payload={chainReference:chainReference.trim()};
    }
    if(!action)return;
    setBusy(intent.id);setNotice(null);
    try{await commerceClient.tokenizationAction(intent.id,action,payload);await refresh();await loadPositions()}
    catch(cause){setNotice(cause instanceof Error?cause.message:"Tokenization update failed")}
    finally{setBusy(null)}
  }

  return <div className="content-container space-y-6">
    <header className="rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#050807] via-[#082218] to-[#0b6b45] p-7 text-white">
      <span className="eyebrow text-emerald-300">POWERCHAIN TOKENIZATION · PET-20 · v1.0.0</span>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Represent verified Energy Positions without creating synthetic physical energy.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Tokenization is optional. Every intent is bounded by available canonical backing, requires human review, waits for an external wallet signature, and updates the Digital Energy representation ledger only after a confirmed chain reference is supplied.</p>
    </header>

    {(error||notice)&&<div className="digital-energy-error"><CircleAlert/><div><strong>Tokenization</strong><span>{notice??error}</span></div></div>}

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <article className="dashboard-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">CREATE INTENT</span><h2>Verified Energy Position → optional chain representation</h2></div><Coins className="h-5 w-5 text-emerald-700"/></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold">Energy Position<select value={positionId} onChange={event=>setPositionId(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">{positions.map(position=><option key={position.id} value={position.id}>{position.id} · {position.source}</option>)}</select></label>
          <label className="text-sm font-semibold">Network<select value={network} onChange={event=>setNetwork(event.target.value as TokenizationNetwork)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3"><option value="SOLANA">Solana</option><option value="SUI">Sui</option></select></label>
          <label className="text-sm font-semibold">Amount (Wh)<input value={amountWh} onChange={event=>setAmountWh(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 font-mono"/></label>
        </div>
        <button type="button" onClick={()=>void create()} disabled={busy==="create"||!positionId} className="mt-5 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy==="create"?"Creating…":"Create tokenization draft"}</button>
      </article>

      <aside className="dashboard-panel">
        <ShieldCheck className="h-5 w-5 text-emerald-700"/>
        <h2 className="mt-4 font-semibold">Backing invariant</h2>
        <pre className="mt-4 overflow-auto rounded-xl bg-black/[.04] p-3 text-xs dark:bg-white/[.05]">Active Solana Wh{"\n"}+ Active Sui Wh{"\n"}≤ Canonical Energy Position backing</pre>
        <p className="mt-3 text-sm text-[var(--muted)]">Confirmation re-checks current backing immediately before adding the chain representation to the canonical Energy RWA ledger.</p>
      </aside>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head"><div><span className="eyebrow">TOKENIZATION ACTION CENTER</span><h2>Review-first representation intents</h2></div><button className="text-link" onClick={()=>void refresh()}><RefreshCw className={loading?"animate-spin":""}/>Refresh</button></div>
      <div className="mt-4 grid gap-3">
        {intents.map(intent=><article key={intent.id} className="grid gap-4 rounded-xl border border-[var(--border)] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><span className={`data-mode-chip ${intent.state==="CONFIRMED"?"live":"degraded"}`}>{statusLabel(intent.state)}</span><span className="text-xs font-semibold text-[var(--muted)]">{intent.network} · PET-20</span></div><h3 className="mt-3 font-semibold">{intent.energyPositionId}</h3><p className="mt-1 text-sm text-[var(--muted)]">{Number(intent.amountWh).toLocaleString()} Wh · review {intent.reviewHash.slice(0,12)}…</p>{intent.chainReference&&<a href={`/explorer?identifier=${encodeURIComponent(intent.chainReference)}`} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-800">Inspect representation <ExternalLink className="h-3 w-3"/></a>}</div>
          <div className="flex flex-wrap gap-2">
            {["DRAFT","REVIEW_REQUIRED","APPROVED","AWAITING_WALLET","SUBMITTED"].includes(intent.state)&&<button disabled={Boolean(busy)} onClick={()=>void advance(intent as Intent)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white">{intent.state==="AWAITING_WALLET"?<WalletCards className="h-4 w-4"/>:<ArrowRight className="h-4 w-4"/>}{nextLabel(intent.state)}</button>}
            {intent.state==="CONFIRMED"&&<span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Ledger represented</span>}
          </div>
        </article>)}
        {!intents.length&&!loading&&<div className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--muted)]">No tokenization intents yet.</div>}
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      <Boundary icon={Database} title="Canonical backing" text="The Energy Position remains the authoritative economic backing record."/>
      <Boundary icon={LockKeyhole} title="Human approval" text="DRAFT → REVIEW_REQUIRED → APPROVED before a wallet step exists."/>
      <Boundary icon={WalletCards} title="External wallet" text="PowerChain records the external signature/reference; agents never sign transactions."/>
    </section>
  </div>;
}
function nextLabel(state:string){return state==="DRAFT"?"Send to review":state==="REVIEW_REQUIRED"?"Approve intent":state==="APPROVED"?"Request wallet step":state==="AWAITING_WALLET"?"Record external signature":state==="SUBMITTED"?"Confirm chain representation":"Complete"}
function Boundary({icon:Icon,title,text}:{icon:typeof Database;title:string;text:string}){return <article className="dashboard-panel"><Icon className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{text}</p></article>}
