"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
type CommerceContextValue={selectedListingId:string|null;setSelectedListingId:(id:string|null)=>void;checkoutSessionId:string|null;setCheckoutSessionId:(id:string|null)=>void};
const CommerceContext=createContext<CommerceContextValue|null>(null);
export function CommerceProvider({children}:{children:ReactNode}){
  const[selectedListingId,setSelectedListingId]=useState<string|null>(null);
  const[checkoutSessionId,setCheckoutSessionId]=useState<string|null>(null);
  const value=useMemo(()=>({selectedListingId,setSelectedListingId,checkoutSessionId,setCheckoutSessionId}),[selectedListingId,checkoutSessionId]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}
export function useCommerceContext(){
  const value=useContext(CommerceContext);
  if(!value)throw new Error("useCommerceContext must be used inside CommerceProvider");
  return value;
}
