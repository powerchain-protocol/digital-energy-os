import "server-only";
import type { CopilotCreditMarketRates,CreditMarketRate } from "./types";

const WRAPPED_SOL="So11111111111111111111111111111111111111112";
const DEFAULT_HERMES="https://hermes.pyth.network";
const DEFAULT_JUPITER="https://api.jup.ag";
const SOL_USD_FEED_ID="ef0d8b6fda2ceba41dbe4067d2da2f38de6d3a3f1a339be71332145ad4d5b56d";

type PythParsed={id:string;price?:{price:string;conf:string;expo:number;publish_time:number}};
function decimalFromExpo(price:string,expo:number){const n=BigInt(price);if(expo>=0)return(n*10n**BigInt(expo)).toString();const decimals=-expo;const neg=n<0n;const abs=neg?-n:n;const raw=abs.toString().padStart(decimals+1,'0');const whole=raw.slice(0,-decimals)||'0';const frac=raw.slice(-decimals).replace(/0+$/,'');return`${neg?'-':''}${whole}${frac?`.${frac}`:''}`}
function timeout(ms=4500){return AbortSignal.timeout(ms)}
async function pythLatest(feedId:string,pair:CreditMarketRate['pair']):Promise<CreditMarketRate|null>{
 const base=(process.env.PYTH_HERMES_URL||DEFAULT_HERMES).replace(/\/$/,'');
 try{const url=new URL(`${base}/v2/updates/price/latest`);url.searchParams.append('ids[]',feedId.replace(/^0x/,''));url.searchParams.set('parsed','true');const response=await fetch(url,{headers:{...(process.env.PYTH_HERMES_API_KEY?{authorization:`Bearer ${process.env.PYTH_HERMES_API_KEY}`}:{})},cache:'no-store',signal:timeout()});if(!response.ok)return null;const body=await response.json() as{parsed?:PythParsed[]};const item=body.parsed?.[0];if(!item?.price)return null;const value=decimalFromExpo(item.price.price,item.price.expo);if(Number(value)<=0)return null;return{pair,price:value,source:'pyth-hermes',observedAt:new Date().toISOString(),publishTime:new Date(item.price.publish_time*1000).toISOString(),confidence:decimalFromExpo(item.price.conf,item.price.expo)}}catch{return null}
}
async function discoverPythFxFeed(query:string){
 const base=(process.env.PYTH_HERMES_URL||DEFAULT_HERMES).replace(/\/$/,'');
 try{const url=new URL(`${base}/v2/price_feeds`);url.searchParams.set('query',query);const response=await fetch(url,{headers:{...(process.env.PYTH_HERMES_API_KEY?{authorization:`Bearer ${process.env.PYTH_HERMES_API_KEY}`}:{})},cache:'no-store',signal:timeout()});if(!response.ok)return null;const body=await response.json() as Array<{id?:string;attributes?:Record<string,string>}>;const candidate=body.find(item=>{const symbol=String(item.attributes?.symbol??item.attributes?.display_symbol??'').toUpperCase();return symbol.includes('EUR')&&symbol.includes('USD')})??body[0];return candidate?.id?.replace(/^0x/,'')??null}catch{return null}
}
async function jupiterSolUsd():Promise<CreditMarketRate|null>{
 const base=(process.env.JUPITER_API_BASE_URL||DEFAULT_JUPITER).replace(/\/$/,'');
 try{const url=new URL(`${base}/price/v3`);url.searchParams.set('ids',WRAPPED_SOL);const response=await fetch(url,{headers:{...(process.env.JUPITER_API_KEY?{'x-api-key':process.env.JUPITER_API_KEY}:{})},cache:'no-store',signal:timeout()});if(!response.ok)return null;const body=await response.json() as Record<string,{usdPrice?:number|string}>;const price=body[WRAPPED_SOL]?.usdPrice;if((typeof price!=='number'&&typeof price!=='string')||Number(price)<=0)return null;return{pair:'SOL/USD',price:String(price),source:'jupiter-price-v3',observedAt:new Date().toISOString()}}catch{return null}
}
function configured(pair:CreditMarketRate['pair'],value:string|undefined):CreditMarketRate|null{const price=value?.trim();if(!price||!/^\d+(\.\d+)?$/.test(price)||Number(price)<=0)return null;return{pair,price,source:'configured-reference',observedAt:new Date().toISOString()}}
export async function fetchCopilotCreditRates():Promise<CopilotCreditMarketRates>{
 const solFeed=(process.env.PYTH_SOL_USD_FEED_ID||SOL_USD_FEED_ID).replace(/^0x/,'');
 const solUsd=await pythLatest(solFeed,'SOL/USD')??await jupiterSolUsd()??configured('SOL/USD',process.env.POWERCHAIN_SOL_USD_REFERENCE);
 let eurFeed=process.env.PYTH_EUR_USD_FEED_ID?.trim()?.replace(/^0x/,'')||null;
 if(!eurFeed)eurFeed=await discoverPythFxFeed('EUR/USD');
 const eurUsd=(eurFeed?await pythLatest(eurFeed,'EUR/USD'):null)??configured('EUR/USD',process.env.POWERCHAIN_EUR_USD_REFERENCE);
 const count=Number(Boolean(solUsd))+Number(Boolean(eurUsd));
 return{...(solUsd?{solUsd}:{}),...(eurUsd?{eurUsd}:{}),observedAt:new Date().toISOString(),state:count===2?'LIVE':count===1?'PARTIAL':'UNAVAILABLE'};
}
