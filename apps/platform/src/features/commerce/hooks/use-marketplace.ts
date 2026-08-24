"use client";
import { useCallback, useEffect, useState } from "react";
import { commerceClient } from "../services/client";
import type { MarketplaceListingView } from "../types";
export function useMarketplace(query=""){
  const[listings,setListings]=useState<MarketplaceListingView[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const[dataMode,setDataMode]=useState<"DEMO"|"LIVE">("DEMO");
  const refresh=useCallback(async()=>{setLoading(true);try{const body=await commerceClient.listMarketplace(query);setListings(body.data);setDataMode(body.meta.dataMode);setError(null)}catch(cause){setError(cause instanceof Error?cause.message:"Marketplace unavailable")}finally{setLoading(false)}},[query]);
  useEffect(()=>{void refresh()},[refresh]);
  return{listings,loading,error,dataMode,refresh};
}
