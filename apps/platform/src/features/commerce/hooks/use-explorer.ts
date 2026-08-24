"use client";
import { useState } from "react";
import type { ExplorerKind, ExplorerNetwork } from "@powerchain/explorer";
import { commerceClient } from "../services/client";
import type { ExplorerResolution } from "../types";
export function useExplorer(){
  const[result,setResult]=useState<ExplorerResolution|null>(null);
  const[busy,setBusy]=useState(false);
  const[error,setError]=useState<string|null>(null);
  async function resolve(network:ExplorerNetwork,kind:ExplorerKind,identifier:string){setBusy(true);try{const body=await commerceClient.resolveExplorer(network,kind,identifier);setResult(body.data);setError(null);return body.data}catch(cause){setError(cause instanceof Error?cause.message:"Explorer resolution failed");throw cause}finally{setBusy(false)}}
  return{result,busy,error,resolve};
}
