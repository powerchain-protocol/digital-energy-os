"use client";
import Link from "next/link";
import { ArrowUp, BookOpenText, Coins, Square } from "lucide-react";
import { useEffect,useRef } from "react";
const MAX=2000;
export interface ComposerCreditInfo{availablePwrc?:string;nextPwrc?:string;nextUsd?:string;pricingClass?:"BASE"|"REAL_DATA";solEquivalent?:string}
export function CopilotComposer({value,onChange,onSubmit,onStop,busy,onOpenPrompts,credits}:{value:string;onChange:(value:string)=>void;onSubmit:()=>void;onStop:()=>void;busy:boolean;onOpenPrompts:()=>void;credits?:ComposerCreditInfo}){
 const ref=useRef<HTMLTextAreaElement>(null);const count=value.length;const progress=Math.min(100,count/MAX*100);const near=count>=1600;const critical=count>=1900;
 useEffect(()=>{const el=ref.current;if(!el)return;el.style.height="0px";el.style.height=`${Math.min(Math.max(el.scrollHeight,52),168)}px`},[value]);
 return <div className="copilot-composer">
  <textarea ref={ref} value={value} maxLength={MAX} rows={2} onChange={event=>onChange(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();onSubmit()}}} placeholder="Ask PowerChain Copilot…" aria-label="Ask PowerChain Copilot"/>
  <div className="copilot-composer-credit" aria-label="Copilot credit pricing"><Coins/><span>{credits?.pricingClass==="REAL_DATA"?"Real-data":"Base"} message</span><strong>{credits?.nextPwrc?`${credits.nextPwrc} PWRC`:"—"}</strong>{credits?.nextUsd&&<small>${credits.nextUsd}</small>}{credits?.solEquivalent&&<small>≈ {credits.solEquivalent} SOL</small>}<Link href="/settings/credits">Buy PWRC / Credits</Link></div>
  <div className="copilot-composer-footer"><div className="flex min-w-0 flex-wrap items-center gap-2"><button type="button" className="composer-secondary" onClick={onOpenPrompts}><BookOpenText/><span>Prompt Library</span></button><div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-black/5 sm:block dark:bg-white/10"><div className={`h-full rounded-full transition-all ${critical?"bg-red-600":near?"bg-amber-500":"bg-emerald-700"}`} style={{width:`${progress}%`}}/></div><span className={`text-xs tabular-nums ${critical?"text-red-600":near?"text-amber-700":"text-[var(--muted)]"}`}>{count.toLocaleString()} / {MAX.toLocaleString()}</span>{credits?.availablePwrc&&<span className="text-xs text-[var(--muted)]">Available {credits.availablePwrc} PWRC</span>}</div>{busy?<button type="button" className="composer-stop" onClick={onStop}><Square/><span>Stop</span></button>:<button type="button" className="composer-send" disabled={!value.trim()} onClick={onSubmit} aria-label="Send message"><ArrowUp/><span className="sr-only">Send</span></button>}</div>
 </div>
}
