"use client";
import { useState } from "react";
import type { CheckoutCurrency, CheckoutLineInput } from "@powerchain/checkout";
import { commerceClient } from "../services/client";
import type { CheckoutSessionView } from "../types";
export function useCheckout(){
  const[session,setSession]=useState<CheckoutSessionView|null>(null);
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState<string|null>(null);
  async function create(currency:CheckoutCurrency,lines:CheckoutLineInput[]){setBusy(true);try{const body=await commerceClient.createCheckout(currency,lines);setSession(body.data);setError(null);return body.data}catch(cause){setError(cause instanceof Error?cause.message:"Checkout unavailable");throw cause}finally{setBusy(false)}}
  async function action(action:"review"|"signature-request"|"submit"|"confirm"|"cancel",payload:Record<string,unknown>={}){if(!session)throw new Error("Checkout session not created");setBusy(true);try{const body=await commerceClient.checkoutAction(session.id,action,payload);setSession(body.data);setError(null);return body.data}catch(cause){setError(cause instanceof Error?cause.message:"Checkout update failed");throw cause}finally{setBusy(false)}}
  return{session,busy,error,create,action};
}
