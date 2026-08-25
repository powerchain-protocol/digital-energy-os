"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ChevronDown,
  CirclePlus,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  History,
  MoreVertical,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CopilotComposer } from "./CopilotComposer";
import { CopilotPromptModal } from "./CopilotPromptModal";
import { MessageContent } from "./MessageContent";
import { ResponseToolbar } from "./ResponseToolbar";
import { StreamStageBar, type StreamStage } from "./StreamStageBar";
import { AiSettingsDrawer } from "@/components/ai/settings-drawer";
import { AiConfigurationBar } from "@/components/ai/configuration-bar";
import { Suggestions } from "./suggestions";
import { readStoredCopilotContext } from "@/context/copilot-context";
import { useCopilotCredits } from "@/hooks/use-copilot-credits";

type Evidence={id:string;type:string;label:string;href:string};
type Message={id:string;role:"user"|"assistant"|"system";content:string;createdAt:string;streaming?:boolean;metadata?:{grounding?:string;evidence?:Evidence[];provider?:string;modelId?:string;latencyMs?:number;sourceCount?:number;reviewIntent?:{state:string;reason:string;actionHref:string};pricingClass?:"BASE"|"REAL_DATA";usdCharge?:string;pwrcAmount?:string;pwrcRaw?:string;solEquivalent?:string;creditReservationId?:string}};
type Conversation={id:string;title:string;updatedAt:string;messageCount:number};

function time(value:string){try{return new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit"}).format(new Date(value))}catch{return""}}

function parseEventBlock(block:string){const lines=block.split("\n");let type="message";const data:string[]=[];for(const line of lines){if(line.startsWith("event:"))type=line.slice(6).trim();if(line.startsWith("data:"))data.push(line.slice(5).trim())}if(!data.length)return null;try{return{type,data:JSON.parse(data.join("\n")) as Record<string,unknown>}}catch{return null}}

export function ChatInterface(){
  const[input,setInput]=useState("");
  const[conversationId,setConversationId]=useState<string|null>(null);
  const[conversations,setConversations]=useState<Conversation[]>([]);
  const[messages,setMessages]=useState<Message[]>([]);
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const[stage,setStage]=useState<StreamStage>("idle");
  const[promptOpen,setPromptOpen]=useState(false);
  const[mobileHistory,setMobileHistory]=useState(false);
  const abortRef=useRef<AbortController|null>(null);
  const scrollRef=useRef<HTMLDivElement>(null);
  const nearBottomRef=useRef(true);
  const credits=useCopilotCredits();
  const[liveBilling,setLiveBilling]=useState<{pricingClass?:"BASE"|"REAL_DATA";usdCharge?:string;pwrcAmount?:string;pwrcRaw?:string;solEquivalent?:string}|null>(null);

  const loadConversations=useCallback(async()=>{
    try{const response=await fetch("/api/v1/copilot/conversations",{cache:"no-store"});const body=await response.json();if(response.ok)setConversations(body.data??[])}catch{/* keep chat usable */}
  },[]);
  useEffect(()=>{void loadConversations()},[loadConversations]);

  useEffect(()=>{if(!nearBottomRef.current)return;const node=scrollRef.current;if(node)requestAnimationFrame(()=>node.scrollTo({top:node.scrollHeight,behavior:busy?"auto":"smooth"}))},[messages,busy,stage]);

  function onScroll(){const node=scrollRef.current;if(!node)return;nearBottomRef.current=node.scrollHeight-node.scrollTop-node.clientHeight<96}

  async function openConversation(id:string){
    if(busy)return;
    setError(null);
    try{const response=await fetch(`/api/v1/copilot/conversations/${encodeURIComponent(id)}`,{cache:"no-store"});const body=await response.json();if(!response.ok)throw new Error(body?.error?.message??"Conversation could not be opened");setConversationId(id);setMessages((body.data.messages??[]).map((item:Message)=>({...item,metadata:item.metadata??{}})));nearBottomRef.current=true;setMobileHistory(false)}catch(cause){setError(cause instanceof Error?cause.message:"Conversation could not be opened")}
  }

  function newConversation(){if(busy)return;setConversationId(null);setMessages([]);setInput("");setError(null);setStage("idle");setMobileHistory(false)}

  async function deleteConversation(id:string){
    if(!window.confirm("Delete this Copilot conversation? This action cannot be undone."))return;
    const response=await fetch(`/api/v1/copilot/conversations/${encodeURIComponent(id)}`,{method:"DELETE"});
    const body=await response.json().catch(()=>null);
    if(!response.ok){setError(body?.error?.message??"Conversation could not be deleted");return}
    if(conversationId===id)newConversation();
    await loadConversations();
  }

  const send=useCallback(async(messageOverride?:string)=>{
    const content=(messageOverride??input).trim();
    if(!content||busy||content.length>2000)return;
    const userMessage:Message={id:`local_user_${crypto.randomUUID()}`,role:"user",content,createdAt:new Date().toISOString()};
    const streamId=`stream_${crypto.randomUUID()}`;
    setMessages(current=>[...current,userMessage,{id:streamId,role:"assistant",content:"",createdAt:new Date().toISOString(),streaming:true,metadata:{}}]);
    if(!messageOverride)setInput("");
    setBusy(true);setError(null);setStage("context");setLiveBilling(null);nearBottomRef.current=true;
    const abort=new AbortController();abortRef.current=abort;
    try{
      const response=await fetch("/api/v1/copilot/stream",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({conversationId,message:content,pageContext:readStoredCopilotContext()}),signal:abort.signal});
      if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error?.message??"Copilot request failed")}
      const reader=response.body?.getReader();if(!reader)throw new Error("Streaming response is unavailable");
      const decoder=new TextDecoder();let buffer="";let persistedConversation=conversationId;let assistantMessageId=streamId;let evidence:Evidence[]=[];let metadata:Message["metadata"]={};
      while(true){const{done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let boundary=buffer.indexOf("\n\n");while(boundary>=0){const block=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);const parsed=parseEventBlock(block);if(parsed){const data=parsed.data;switch(parsed.type){case"meta":persistedConversation=String(data.conversationId??persistedConversation??"");if(persistedConversation)setConversationId(persistedConversation);break;case"stage":{const name=String(data.stage);const state=String(data.state);if(state==="active"&&(name==="context"||name==="generate"||name==="verify"))setStage(name);break}case"delta":{const text=String(data.text??"");setMessages(current=>current.map(item=>item.id===streamId?{...item,content:item.content+text}:item));break}case"billing":{const billing={pricingClass:(data.pricingClass==="REAL_DATA"?"REAL_DATA":"BASE") as "BASE"|"REAL_DATA",usdCharge:String(data.usdCharge??""),pwrcAmount:String(data.pwrcAmount??""),pwrcRaw:String(data.pwrcRaw??""),...(data.solEquivalent?{solEquivalent:String(data.solEquivalent)}:{})};setLiveBilling(billing);metadata={...metadata,...billing,...(data.reservationId?{creditReservationId:String(data.reservationId)}:{})};break;}case"evidence":evidence=Array.isArray(data.sources)?data.sources as Evidence[]:[];metadata={...metadata,grounding:String(data.grounding??"limited"),evidence,sourceCount:evidence.length};break;case"usage":metadata={...metadata,provider:String(data.provider??"PowerChain"),modelId:String(data.modelId??"Copilot"),latencyMs:Number(data.latencyMs??0)};break;case"review_intent":metadata={...metadata,reviewIntent:data as unknown as NonNullable<Message["metadata"]>["reviewIntent"]};break;case"done":assistantMessageId=String(data.assistantMessageId??assistantMessageId);setStage("done");setMessages(current=>current.map(item=>item.id===streamId?{...item,id:assistantMessageId,streaming:false,metadata}:item));break;case"error":throw new Error(String(data.message??"Copilot stream failed"));}}
          boundary=buffer.indexOf("\n\n");}
      }
      setMessages(current=>current.map(item=>item.id===streamId?{...item,id:assistantMessageId,streaming:false,metadata}:item));
      await Promise.all([loadConversations(),credits.refresh()]);
    }catch(cause){if(abort.signal.aborted){setMessages(current=>current.map(item=>item.id===streamId?{...item,streaming:false,metadata:{...item.metadata,grounding:"cancelled"}}:item));setStage("idle")}else{setMessages(current=>current.filter(item=>item.id!==streamId));setError(cause instanceof Error?cause.message:"PowerChain Copilot is temporarily unavailable");setStage("idle")}}
    finally{setBusy(false);abortRef.current=null}
  },[busy,conversationId,input,loadConversations,credits.refresh]);

  function stop(){abortRef.current?.abort()}
  const latestUser=useMemo(()=>[...messages].reverse().find(message=>message.role==="user")?.content,[messages]);

  return <div className="copilot-chat-layout">
    <aside className={`copilot-history ${mobileHistory?"mobile-open":""}`}>
      <div className="copilot-history-head"><div><span className="eyebrow">POWERCHAIN COPILOT</span><strong>Conversations</strong></div><button type="button" className="icon-button" onClick={newConversation} aria-label="New conversation"><CirclePlus/></button></div>
      <div className="copilot-history-list">{conversations.map(item=><div key={item.id} className={item.id===conversationId?"active":""}><button type="button" onClick={()=>void openConversation(item.id)}><span>{item.title}</span><small>{item.messageCount} messages · {time(item.updatedAt)}</small></button><button type="button" className="history-delete" onClick={()=>void deleteConversation(item.id)} aria-label={`Delete ${item.title}`}><Trash2/></button></div>)}{!conversations.length&&<p>No saved conversations yet.</p>}</div>
    </aside>

    <section className="copilot-chat-panel">
      <header className="copilot-chat-header">
        <div className="flex min-w-0 items-center gap-3"><span className="copilot-chat-mark"><Bot/></span><div className="min-w-0"><h1>PowerChain Copilot</h1><p>Energy · assets · devices · treasury · RWA</p></div></div>
        <div className="flex items-center gap-2"><button type="button" className="history-mobile-button" onClick={()=>setMobileHistory(value=>!value)}><History/><span>Recent</span></button><AiSettingsDrawer/></div>
      </header>
      <div className="copilot-config"><AiConfigurationBar/></div>

      <div ref={scrollRef} onScroll={onScroll} className="copilot-thread" aria-live="polite">
        {!messages.length&&<div className="copilot-empty"><span><Gauge/></span><h2>How can I help with your energy operations?</h2><p>Ask about My Energy, connected devices, renewable production, Energy RWA, treasury controls, alerts, reports, or tokenization.</p><Suggestions onSelect={setInput}/></div>}
        {messages.map(message=><article key={message.id} className={`copilot-message ${message.role}`}>
          <div className="copilot-message-avatar">{message.role==="assistant"?<Bot/>:<span>YOU</span>}</div>
          <div className="copilot-message-content"><header><strong>{message.role==="assistant"?"PowerChain Copilot":"You"}</strong><time><Clock3/>{time(message.createdAt)}</time></header><MessageContent content={message.content} streaming={message.streaming}/>{message.role==="assistant"&&!message.streaming&&<><details className="copilot-evidence"><summary><span><ShieldCheck/>Evidence & provenance</span><span>{message.metadata?.sourceCount??message.metadata?.evidence?.length??0} sources <ChevronDown/></span></summary><div>{message.metadata?.evidence?.length?message.metadata.evidence.map(source=><Link key={source.id} href={source.href}><FileText/><span><strong>{source.label}</strong><small>{source.type}</small></span><ExternalLink/></Link>):<p>No linked PowerChain evidence was required for this response. Treat the answer as limited grounding.</p>}</div></details><div className="copilot-response-meta"><span>{message.metadata?.grounding??"limited"}</span><span>{message.metadata?.provider??"PowerChain"}</span>{message.metadata?.pwrcAmount&&<span>{message.metadata.pwrcAmount} PWRC · ${message.metadata.usdCharge}</span>}{message.metadata?.modelId&&<span>{message.metadata.modelId}</span>}{typeof message.metadata?.latencyMs==="number"&&<span>{message.metadata.latencyMs} ms</span>}</div>{message.metadata?.reviewIntent&&<Link className="copilot-review-intent" href={message.metadata.reviewIntent.actionHref}><ShieldCheck/><span><strong>Action requires review</strong><small>{message.metadata.reviewIntent.reason}</small></span></Link>}<ResponseToolbar messageId={message.id} content={message.content} onRegenerate={()=>{if(latestUser)void send(latestUser)}}/></>}</div>
        </article>)}
        {busy&&<div className="sticky bottom-2 z-10 mx-auto max-w-xl"><StreamStageBar stage={stage}/></div>}
      </div>

      <footer className="copilot-composer-wrap">{error&&<div role="alert" className="copilot-chat-error">{error}</div>}<CopilotComposer value={input} onChange={setInput} onSubmit={()=>void send()} onStop={stop} busy={busy} onOpenPrompts={()=>setPromptOpen(true)} credits={{availablePwrc:credits.account?.availablePwrc,nextPwrc:liveBilling?.pwrcAmount??credits.quote?.pwrcAmount,nextUsd:liveBilling?.usdCharge??credits.quote?.usdCharge,pricingClass:liveBilling?.pricingClass??credits.quote?.pricingClass,solEquivalent:liveBilling?.solEquivalent??credits.quote?.solEquivalent}}/><p>Copilot prepares analysis and reviewable action intents. Wallet signatures, protected device commands, token issuance, and treasury execution remain outside model authority.</p></footer>
    </section>
    <CopilotPromptModal open={promptOpen} onClose={()=>setPromptOpen(false)} onInsert={setInput}/>
  </div>
}
