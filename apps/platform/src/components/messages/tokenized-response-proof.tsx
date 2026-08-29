"use client";
import { useState } from "react";
import { CheckCircle2, FileKey2, ShieldCheck } from "lucide-react";
import type { ChatTokenizedProofSummary } from "@/types/ai/chat";
import { getMessageTokenProof,verifyMessageTokenProof } from "@/lib/chat/tokenized-chat-client";

function short(value:string){return value.length>14?`${value.slice(0,8)}…${value.slice(-4)}`:value}
export function TokenizedResponseProof({proof,conversationId,messageId}:{proof:ChatTokenizedProofSummary;conversationId:string;messageId:string}){
 const[state,setState]=useState<"idle"|"checking"|"valid"|"invalid"|"error">("idle");
 async function verify(){setState("checking");try{const record=await getMessageTokenProof(conversationId,messageId),result=await verifyMessageTokenProof(record);setState(result.valid?"valid":"invalid")}catch{setState("error")}}
 return <section className="mt-3 min-w-0 overflow-hidden rounded-xl border border-emerald-800/20 bg-emerald-950/[.035] p-3" aria-label="Tokenized response proof">
  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-800/10 text-emerald-800"><FileKey2 className="h-4 w-4"/></span><div className="min-w-0"><strong className="block truncate text-xs">Tokenized response proof</strong><span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3"/>SETTLED</span></div></div><span className="rounded-full border border-emerald-700/20 bg-white/60 px-2 py-1 text-[10px] font-bold tabular-nums dark:bg-black/20">10,000 PWRC · 1 MSG UNIT</span></div>
  <dl className="mt-3 grid min-w-0 gap-2 text-[11px] sm:grid-cols-2"><div className="min-w-0"><dt className="text-[var(--muted)]">Receipt</dt><dd className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono" title={proof.receiptId}>{short(proof.receiptId)}</dd></div><div className="min-w-0"><dt className="text-[var(--muted)]">Proof</dt><dd className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-mono" title={proof.proofHash}>{short(proof.proofHash)}</dd></div></dl>
  <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2"><button type="button" onClick={()=>void verify()} disabled={state==="checking"} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px] font-semibold hover:bg-black/[.03] disabled:opacity-60 dark:hover:bg-white/[.04]">{state==="checking"?"Verifying…":"Verify proof"}</button>{state==="valid"&&<span className="text-[10px] font-semibold text-emerald-700">Cryptographic references verified</span>}{state==="invalid"&&<span className="text-[10px] font-semibold text-red-600">Verification mismatch</span>}{state==="error"&&<span className="text-[10px] text-amber-700">Verification service unavailable</span>}</div>
  <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-[var(--muted)]"><ShieldCheck className="mt-0.5 h-3 w-3 shrink-0"/>Non-transferable receipt reference. Not a minted asset or financial instrument.</p>
 </section>
}
