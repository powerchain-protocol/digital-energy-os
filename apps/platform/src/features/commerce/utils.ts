export function minorToDecimal(value:string,decimals=2){
  const amount=BigInt(value||"0");
  const scale=10n**BigInt(decimals);
  return Number(amount)/Number(scale);
}
export function decimalToMinor(value:number,decimals=2){
  if(!Number.isFinite(value)||value<0)throw new Error("COMMERCE_AMOUNT_INVALID");
  return BigInt(Math.round(value*10**decimals)).toString();
}
export function createIdempotencyKey(scope:string){
  return `${scope}-${crypto.randomUUID()}`;
}
export function shortIdentifier(value:string,size=6){
  return value.length<=size*2+3?value:`${value.slice(0,size)}…${value.slice(-size)}`;
}
export function statusLabel(value:string){
  return value.toLowerCase().replaceAll("_"," ").replace(/\b\w/g,char=>char.toUpperCase());
}
