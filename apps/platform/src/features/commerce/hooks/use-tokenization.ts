"use client";
import { useCallback, useEffect, useState } from "react";
import { commerceClient } from "../services/client";
import type { TokenizationIntentView } from "../types";
export function useTokenization(){
  const[intents,setIntents]=useState<TokenizationIntentView[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const refresh=useCallback(async()=>{setLoading(true);try{const body=await commerceClient.listTokenization();setIntents(body.data);setError(null)}catch(cause){setError(cause instanceof Error?cause.message:"Tokenization unavailable")}finally{setLoading(false)}},[]);
  useEffect(()=>{void refresh()},[refresh]);
  return{intents,loading,error,refresh};
}
