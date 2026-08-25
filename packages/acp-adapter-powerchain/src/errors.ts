export class PowerChainAcpAdapterError extends Error{
  constructor(readonly code:string,message:string,readonly cause?:unknown){super(message);this.name="PowerChainAcpAdapterError"}
}
export function ambiguous(error:unknown){
  if(error instanceof DOMException&&error.name==="AbortError")return true;
  const message=error instanceof Error?error.message.toLowerCase():String(error).toLowerCase();
  return /timeout|timed out|socket|connection reset|econnreset|econnaborted|network/.test(message);
}
