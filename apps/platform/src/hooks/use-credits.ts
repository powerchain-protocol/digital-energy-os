"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import type { CopilotCreditAccountView,CopilotCreditQuoteView,CopilotDisplayCurrency } from "@powerchain/credits/types";
export function useCredits(initialCurrency:CopilotDisplayCurrency="USD"){
 const[account,setAccount]=useState<CopilotCreditAccountView|null>(null);const[quote,setQuote]=useState<CopilotCreditQuoteView|null>(null);const[currency,setCurrency]=useState<CopilotDisplayCurrency>(initialCurrency);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);
 const refresh=useCallback(async()=>{setLoading(true);try{const response=await fetch('/api/v1/copilot/credits',{cache:'no-store'});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.error?.message??'Copilot credits are unavailable');setAccount(body.data?.account??null);setError(null)}catch(cause){setError(cause instanceof Error?cause.message:'Copilot credits are unavailable')}finally{setLoading(false)}},[]);
 const refreshQuote=useCallback(async(pricingClass:'BASE'|'REAL_DATA'='BASE',nextCurrency:CopilotDisplayCurrency=currency)=>{try{const response=await fetch('/api/v1/copilot/credits/quote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pricingClass,currency:nextCurrency})});const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.error?.message??'Pricing quote is unavailable');setQuote(body.data??null);setError(null);return body.data as CopilotCreditQuoteView}catch(cause){setError(cause instanceof Error?cause.message:'Pricing quote is unavailable');return null}},[currency]);
 useEffect(()=>{void refresh();void refreshQuote('BASE',currency)},[refresh,refreshQuote,currency]);
 return useMemo(()=>({account,quote,currency,setCurrency,loading,error,refresh,refreshQuote}),[account,quote,currency,loading,error,refresh,refreshQuote]);
}
