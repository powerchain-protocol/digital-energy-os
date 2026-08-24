"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Database, Link2, Network, Search, ShieldCheck } from "lucide-react";
import type { ExplorerKind, ExplorerNetwork } from "@powerchain/explorer";
import { useExplorer } from "@/features/commerce/hooks/use-explorer";
import { shortIdentifier } from "@/features/commerce/utils";

const networks:{id:ExplorerNetwork;label:string;family:"SOLANA"|"SUI"}[]=[
  {id:"solana-mainnet-beta",label:"Solana Mainnet",family:"SOLANA"},
  {id:"solana-devnet",label:"Solana Devnet",family:"SOLANA"},
  {id:"sui-mainnet",label:"Sui Mainnet",family:"SUI"},
  {id:"sui-testnet",label:"Sui Testnet",family:"SUI"},
  {id:"sui-devnet",label:"Sui Devnet",family:"SUI"},
];

export function ExplorerWorkspace(){
  const params=useSearchParams();
  const[network,setNetwork]=useState<ExplorerNetwork>("solana-mainnet-beta");
  const[kind,setKind]=useState<ExplorerKind>("transaction");
  const[identifier,setIdentifier]=useState(params.get("identifier")??"");
  const{result,busy,error,resolve}=useExplorer();
  const family=networks.find(item=>item.id===network)?.family??"SOLANA";
  const kinds=useMemo<ExplorerKind[]>(()=>family==="SOLANA"?["transaction","address","token","program"]:["transaction","address","object"],[family]);

  useEffect(()=>{if(!kinds.includes(kind))setKind(kinds[0]!)},[family,kinds,kind]);

  async function submit(){
    if(!identifier.trim())return;
    await resolve(network,kind,identifier.trim());
  }

  return <div className="content-container space-y-6">
    <header className="rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#050807] via-[#071711] to-[#0d4a32] p-7 text-white">
      <span className="eyebrow text-emerald-300">POWERCHAIN EXPLORER · v1.0.0</span>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Resolve chain activity without hard-coding explorer logic across apps.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">One canonical resolver supports Solana and Sui transaction, address, token, program and object references. Explorer links are navigation aids, not proof of physical energy delivery.</p>
    </header>

    <section className="panel p-5">
      <div className="grid gap-3 lg:grid-cols-[220px_180px_minmax(0,1fr)_auto]">
        <label className="text-sm font-semibold">Network<select value={network} onChange={event=>setNetwork(event.target.value as ExplorerNetwork)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">{networks.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="text-sm font-semibold">Resource<select value={kind} onChange={event=>setKind(event.target.value as ExplorerKind)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3">{kinds.map(item=><option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-sm font-semibold">Identifier<input value={identifier} onChange={event=>setIdentifier(event.target.value)} placeholder="Transaction signature, address, token, program, or object ID" className="mt-2 w-full rounded-xl border border-[var(--border)] bg-transparent p-3 font-mono text-xs"/></label>
        <button type="button" disabled={busy||identifier.trim().length<16} onClick={()=>void submit()} className="self-end rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Search className="mr-2 inline h-4 w-4"/>{busy?"Resolving…":"Resolve"}</button>
      </div>
      {error&&<p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>

    {result&&<section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="dashboard-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">RESOLVED RESOURCE</span><h2>{result.network}</h2></div><Network className="h-5 w-5 text-emerald-700"/></div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Info label="Family" value={result.family}/>
          <Info label="Kind" value={result.kind}/>
          <Info label="Identifier" value={shortIdentifier(result.identifier,12)} mono/>
          <Info label="Resolver" value="@powerchain/explorer"/>
        </dl>
        <a href={result.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white">Open external explorer <ArrowUpRight className="h-4 w-4"/></a>
      </article>
      <aside className="dashboard-panel">
        <ShieldCheck className="h-5 w-5 text-emerald-700"/>
        <h2 className="mt-4 font-semibold">Authority boundary</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Chain inclusion can confirm a transaction or object exists. It does not prove meter readings, physical energy delivery, or financial reconciliation unless those domains separately verify their evidence.</p>
      </aside>
    </section>}

    <section className="grid gap-4 md:grid-cols-3">
      <Card icon={Link2} title="Canonical URLs" text="Explorer URL construction lives in one package instead of duplicated UI utilities."/>
      <Card icon={Database} title="Multi-network" text="Solana and Sui resource semantics remain explicit and network-specific."/>
      <Card icon={ShieldCheck} title="Evidence aware" text="Explorer references are provenance links, not replacements for authoritative energy evidence."/>
    </section>
  </div>;
}
function Info({label,value,mono=false}:{label:string;value:string;mono?:boolean}){return <div className="rounded-xl border border-[var(--border)] p-3"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className={`mt-1 text-sm font-semibold ${mono?"font-mono":""}`}>{value}</dd></div>}
function Card({icon:Icon,title,text}:{icon:typeof Link2;title:string;text:string}){return <article className="dashboard-panel"><Icon className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{text}</p></article>}
