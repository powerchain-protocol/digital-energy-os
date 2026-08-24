import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { PostgresCommerceRepository } from "@powerchain/database/commerce";
import { createCheckoutService, type CheckoutCurrency, type CheckoutLineInput } from "@powerchain/checkout";
import { EXPLORER_NETWORKS, resolveExplorerUrl, type ExplorerKind, type ExplorerNetwork } from "@powerchain/explorer";
import { assertTokenizationAmount, type TokenizationIntentState, type TokenizationNetwork } from "@powerchain/tokenization";
import { energyListings } from "@/data/marketplace";
import { getSession } from "@/lib/auth/sessions";
import { SESSION_COOKIE, securityHeaders } from "@/lib/security/security";
import { getDigitalEnergyPositionBacking, representDigitalEnergyPosition, type DigitalEnergyRequestContext } from "@/lib/digital-energy/server";

export interface CommerceContext{
  organizationId:string;
  userId:string;
  role:string;
  accessMode:"SESSION"|"DEMO"|"UNAUTHENTICATED";
  requestId:string;
  correlationId:string;
  dataMode:"DEMO"|"LIVE";
}

const globalStore=globalThis as unknown as{
  commerceRepository?:PostgresCommerceRepository;
  demoMarketplaceListings?:Map<string,Map<string,any>>;
  demoMarketplaceOrders?:Map<string,Map<string,any>>;
  demoCheckoutServices?:Map<string,ReturnType<typeof createCheckoutService>>;
  demoTokenization?:Map<string,Map<string,any>>;
};
globalStore.commerceRepository??=new PostgresCommerceRepository();
globalStore.demoMarketplaceListings??=new Map();
globalStore.demoMarketplaceOrders??=new Map();
globalStore.demoCheckoutServices??=new Map();
globalStore.demoTokenization??=new Map();

export function commerceDatabaseConfigured(){return Boolean(process.env.DATABASE_URL?.trim())}

export async function getCommerceContext(request:Request):Promise<CommerceContext>{
  const jar=await cookies();
  const session=getSession(jar.get(SESSION_COOKIE)?.value);
  const live=commerceDatabaseConfigured();
  const organizationId=session?.user.organizationId??(!live?(request.headers.get("x-organization-id")?.trim()||"org_powerchain_demo"):"org_unauthenticated");
  const userId=session?.user.id??(!live?(request.headers.get("x-user-id")?.trim()||"user_demo"):"user_unauthenticated");
  const role=session?.user.role??(!live?"demo":"unauthenticated");
  return{
    organizationId,userId,role,
    accessMode:session?"SESSION":live?"UNAUTHENTICATED":"DEMO",
    requestId:request.headers.get("x-request-id")?.trim()||crypto.randomUUID(),
    correlationId:request.headers.get("x-correlation-id")?.trim()||crypto.randomUUID(),
    dataMode:live?"LIVE":"DEMO",
  };
}

export function requireCommerceAccess(context:CommerceContext,write=false){
  if(commerceDatabaseConfigured()&&context.accessMode==="UNAUTHENTICATED")throw Object.assign(new Error("LIVE commerce data requires an authenticated tenant session"),{code:"COMMERCE_AUTH_REQUIRED"});
  if(write&&commerceDatabaseConfigured()&&!["prosumer","company","admin","super-admin"].includes(context.role))throw Object.assign(new Error("Commerce writes require an authorized operator"),{code:"COMMERCE_WRITE_FORBIDDEN"});
}

export function requireCommerceIdempotency(request:Request){
  const key=request.headers.get("idempotency-key")?.trim();
  if(!key||key.length<8||key.length>160)throw Object.assign(new Error("Economic writes require Idempotency-Key (8–160 characters)"),{code:"COMMERCE_IDEMPOTENCY_REQUIRED"});
  return key;
}

function serialize(value:unknown):unknown{
  if(typeof value==="bigint")return value.toString();
  if(value instanceof Date)return value.toISOString();
  if(Array.isArray(value))return value.map(serialize);
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).map(([key,item])=>[key,serialize(item)]));
  return value;
}

export function commerceResponse(data:unknown,context:CommerceContext,init:ResponseInit={}){
  const headers=new Headers(init.headers);
  for(const[key,value]of Object.entries(securityHeaders))headers.set(key,value);
  headers.set("x-request-id",context.requestId);
  headers.set("x-correlation-id",context.correlationId);
  headers.set("x-powerchain-data-mode",context.dataMode);
  return Response.json({data:serialize(data),meta:{requestId:context.requestId,correlationId:context.correlationId,organizationId:context.organizationId,dataMode:context.dataMode,observedAt:new Date().toISOString()}},{...init,headers});
}

export function commerceError(error:unknown,context:CommerceContext){
  const raw=error&&typeof error==="object"&&"code" in error?String((error as{code?:unknown}).code):error instanceof Error?error.message:"COMMERCE_ERROR";
  const databaseFailure=commerceDatabaseConfigured()&&!raw.startsWith("COMMERCE_")&&!raw.startsWith("MARKETPLACE_")&&!raw.startsWith("CHECKOUT_")&&!raw.startsWith("TOKENIZATION_")&&!raw.startsWith("EXPLORER_");
  const code=databaseFailure?"COMMERCE_DATABASE_UNAVAILABLE":raw;
  const message=databaseFailure?"Commerce database is unavailable":error instanceof Error?error.message:"Commerce request failed";
  const status=code==="COMMERCE_DATABASE_UNAVAILABLE"?503:code==="COMMERCE_AUTH_REQUIRED"?401:code==="COMMERCE_WRITE_FORBIDDEN"?403:code.includes("NOT_FOUND")?404:code.includes("CONFLICT")||code.includes("UNAVAILABLE")||code.includes("STATE")||code.includes("EXCEEDS")?409:400;
  return Response.json({error:{code,message,requestId:context.requestId}},{status,headers:securityHeaders});
}

function demoListings(organizationId:string){
  let store=globalStore.demoMarketplaceListings!.get(organizationId);
  if(store)return store;
  store=new Map();
  const now=new Date().toISOString();
  for(const item of energyListings){
    store.set(item.id,{
      id:item.id,organizationId,sellerId:`seller_${item.slug}`,slug:item.slug,title:item.name,description:`Verified ${item.source.toLowerCase()} energy from ${item.location}.`,
      category:"ENERGY",source:item.source,location:item.location,currency:"USDC",unitAmountMinor:String(Math.round(item.price*1_000_000)),inventory:item.available,remaining:item.available,
      status:"active",metadata:{verified:item.verified,distanceKm:item.distanceKm,carbonIntensity:item.carbonIntensity,delivery:item.delivery,rating:item.rating},createdAt:now,updatedAt:now,
    });
  }
  globalStore.demoMarketplaceListings!.set(organizationId,store);
  return store;
}

export async function listMarketplace(context:CommerceContext,query=""){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.listMarketplaceListings(context.organizationId,query)}
  context.dataMode="DEMO";
  const normalized=query.trim().toLowerCase();
  return[...demoListings(context.organizationId).values()].filter(item=>item.status==="active"&&(!normalized||`${item.title} ${item.description} ${item.source} ${item.location}`.toLowerCase().includes(normalized)));
}

export async function getMarketplaceListingBySlug(context:CommerceContext,slug:string){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.getMarketplaceListingBySlug(context.organizationId,slug)}
  context.dataMode="DEMO";return [...demoListings(context.organizationId).values()].find(item=>item.slug===slug)??null;
}

export async function createMarketplaceListing(context:CommerceContext,input:{title:string;description:string;category:string;source?:string;location?:string;currency:CheckoutCurrency;unitAmountMinor:string;inventory:number;slug?:string}){
  if(!commerceDatabaseConfigured())throw Object.assign(new Error("Persistent marketplace listing creation requires DATABASE_URL"),{code:"COMMERCE_DATABASE_REQUIRED"});
  context.dataMode="LIVE";
  const slug=(input.slug||input.title).trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);
  return globalStore.commerceRepository!.createMarketplaceListing({id:`mpl_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,sellerId:context.userId,slug,...input});
}

export async function activateMarketplaceListing(context:CommerceContext,id:string){
  if(!commerceDatabaseConfigured())throw Object.assign(new Error("Marketplace activation requires DATABASE_URL"),{code:"COMMERCE_DATABASE_REQUIRED"});
  context.dataMode="LIVE";return globalStore.commerceRepository!.activateMarketplaceListing(context.organizationId,id);
}

export async function reserveMarketplace(context:CommerceContext,input:{listingId:string;quantity:number;idempotencyKey:string}){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.reserveMarketplaceOrder({id:`mko_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,buyerId:context.userId,...input})}
  context.dataMode="DEMO";
  const listing=demoListings(context.organizationId).get(input.listingId);
  if(!listing)throw Object.assign(new Error("Marketplace listing not found"),{code:"MARKETPLACE_LISTING_NOT_FOUND"});
  if(input.quantity<1||input.quantity>listing.remaining)throw Object.assign(new Error("Requested quantity is unavailable"),{code:"MARKETPLACE_QUANTITY_UNAVAILABLE"});
  let orders=globalStore.demoMarketplaceOrders!.get(context.organizationId);if(!orders){orders=new Map();globalStore.demoMarketplaceOrders!.set(context.organizationId,orders)}
  const key=`${context.organizationId}:${input.idempotencyKey}`;
  const replay=[...orders.values()].find(order=>order.idempotencyKey===key);
  if(replay){
    if(replay.listingId!==input.listingId||replay.quantity!==input.quantity)throw Object.assign(new Error("Idempotency key was reused with a different marketplace order payload"),{code:"MARKETPLACE_IDEMPOTENCY_CONFLICT"});
    return replay;
  }
  const now=new Date().toISOString();
  const order={id:`mko_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,listingId:listing.id,buyerId:context.userId,quantity:input.quantity,amountMinor:(BigInt(listing.unitAmountMinor)*BigInt(input.quantity)).toString(),currency:listing.currency,status:"reserved",idempotencyKey:key,createdAt:now,updatedAt:now};
  listing.remaining-=input.quantity;if(listing.remaining===0)listing.status="sold_out";
  orders.set(order.id,order);return order;
}


export async function listMarketplaceOrders(context:CommerceContext){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.listMarketplaceOrders(context.organizationId,100)}
  context.dataMode="DEMO";
  return [...(globalStore.demoMarketplaceOrders!.get(context.organizationId)?.values()??[])].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getMarketplaceOrder(context:CommerceContext,id:string){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.getMarketplaceOrder(context.organizationId,id)}
  context.dataMode="DEMO";
  return globalStore.demoMarketplaceOrders!.get(context.organizationId)?.get(id)??null;
}

export async function attachMarketplaceCheckout(context:CommerceContext,orderId:string,checkoutSessionId:string){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.attachCheckout({organizationId:context.organizationId,orderId,checkoutSessionId})}
  context.dataMode="DEMO";
  const order=globalStore.demoMarketplaceOrders!.get(context.organizationId)?.get(orderId);
  if(!order)throw Object.assign(new Error("Marketplace order not found"),{code:"MARKETPLACE_ORDER_NOT_FOUND"});
  if(order.status!=="reserved")throw Object.assign(new Error("Marketplace order is not reservable for checkout"),{code:"MARKETPLACE_ORDER_STATE_INVALID"});
  const updated={...order,status:"checkout_pending",checkoutSessionId,updatedAt:new Date().toISOString()};
  globalStore.demoMarketplaceOrders!.get(context.organizationId)!.set(orderId,updated);
  return updated;
}

export async function cancelMarketplaceOrder(context:CommerceContext,orderId:string){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.cancelMarketplaceOrder({organizationId:context.organizationId,orderId})}
  context.dataMode="DEMO";
  const orders=globalStore.demoMarketplaceOrders!.get(context.organizationId);
  const order=orders?.get(orderId);
  if(!order)throw Object.assign(new Error("Marketplace order not found"),{code:"MARKETPLACE_ORDER_NOT_FOUND"});
  if(order.status==="cancelled")return order;
  if(order.status==="paid")throw Object.assign(new Error("Paid marketplace orders cannot be cancelled"),{code:"MARKETPLACE_ORDER_STATE_INVALID"});
  const listing=demoListings(context.organizationId).get(order.listingId);
  if(listing){listing.remaining=Math.min(listing.inventory,listing.remaining+order.quantity);if(listing.status==="sold_out")listing.status="active"}
  const updated={...order,status:"cancelled",updatedAt:new Date().toISOString()};orders!.set(orderId,updated);return updated;
}

async function markMarketplaceOrderPaid(context:CommerceContext,orderId:string,checkoutSessionId:string){
  if(commerceDatabaseConfigured())return globalStore.commerceRepository!.markMarketplacePaid({organizationId:context.organizationId,orderId,checkoutSessionId});
  const order=globalStore.demoMarketplaceOrders!.get(context.organizationId)?.get(orderId);
  if(!order)return null;
  if(order.checkoutSessionId!==checkoutSessionId)throw Object.assign(new Error("Marketplace checkout session does not match"),{code:"MARKETPLACE_ORDER_CHECKOUT_INVALID"});
  const updated={...order,status:"paid",updatedAt:new Date().toISOString()};
  globalStore.demoMarketplaceOrders!.get(context.organizationId)!.set(orderId,updated);
  return updated;
}

function demoCheckoutService(organizationId:string){
  let service=globalStore.demoCheckoutServices!.get(organizationId);
  if(!service){service=createCheckoutService();globalStore.demoCheckoutServices!.set(organizationId,service)}
  return service;
}

export async function createCheckout(context:CommerceContext,input:{currency:CheckoutCurrency;lines:CheckoutLineInput[];returnUrl?:string;idempotencyKey:string}){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.createCheckout({id:`chk_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,userId:context.userId,...input})}
  context.dataMode="DEMO";return demoCheckoutService(context.organizationId).create({currency:input.currency,lines:input.lines,...(input.returnUrl?{returnUrl:input.returnUrl}:{})});
}

export async function listCheckouts(context:CommerceContext){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.listCheckouts(context.organizationId,100)}
  context.dataMode="DEMO";
  return [];
}

export async function getCheckout(context:CommerceContext,id:string){
  let session;
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";session=await globalStore.commerceRepository!.getCheckout(context.organizationId,id)}
  else{context.dataMode="DEMO";session=demoCheckoutService(context.organizationId).get(id)}
  if(session?.status==="expired"){
    for(const line of session.lines){if(line.id.startsWith("mko_"))await cancelMarketplaceOrder(context,line.id)}
  }
  return session;
}

export async function checkoutAction(context:CommerceContext,id:string,action:"review"|"signature-request"|"submit"|"confirm"|"cancel",payload:{payerWallet?:string;signature?:string}={}){
  if(commerceDatabaseConfigured()){
    context.dataMode="LIVE";
    const next=action==="review"?"REVIEW":action==="signature-request"?"PENDING_SIGNATURE":action==="submit"?"SUBMITTED":action==="confirm"?"CONFIRMED":"CANCELLED";
    const session=await globalStore.commerceRepository!.transitionCheckout({organizationId:context.organizationId,id,next,...(payload.payerWallet?{payerWallet:payload.payerWallet}:{}),...(payload.signature?{settlementSignature:payload.signature}:{})});
    if(action==="confirm"){
      for(const line of session.lines){
        if(line.id.startsWith("mko_"))await markMarketplaceOrderPaid(context,line.id,session.id);
      }
    }
    if(action==="cancel"){
      for(const line of session.lines){
        if(line.id.startsWith("mko_"))await cancelMarketplaceOrder(context,line.id);
      }
    }
    return session;
  }
  context.dataMode="DEMO";
  const service=demoCheckoutService(context.organizationId);
  let session;
  if(action==="review")session=service.review(id);
  else if(action==="signature-request")session=service.requestSignature(id,payload.payerWallet??"");
  else if(action==="submit")session=service.submit(id,payload.signature??"");
  else if(action==="confirm")session=service.confirm(id,payload.signature??"");
  else session=service.cancel(id);
  if(action==="confirm"){
    for(const line of session.lines){
      if(line.id.startsWith("mko_"))await markMarketplaceOrderPaid(context,line.id,session.id);
    }
  }
  if(action==="cancel"){
    for(const line of session.lines){
      if(line.id.startsWith("mko_"))await cancelMarketplaceOrder(context,line.id);
    }
  }
  return session;
}

export function listExplorerNetworks(){
  return Object.values(EXPLORER_NETWORKS).map(item=>({id:item.id,family:item.family,label:item.label,chainId:item.chainId,enabled:item.enabled,kinds:item.kinds}));
}

export function resolveExplorer(network:ExplorerNetwork,kind:ExplorerKind,identifier:string){
  return{network,kind,identifier,family:EXPLORER_NETWORKS[network].family,url:resolveExplorerUrl(network,kind,identifier)};
}

function digitalContext(context:CommerceContext):DigitalEnergyRequestContext{
  return{organizationId:context.organizationId,userId:context.userId,role:context.role,accessMode:context.accessMode==="SESSION"?"SESSION":context.accessMode==="DEMO"?"DEMO":"UNAUTHENTICATED",requestId:context.requestId,correlationId:context.correlationId,dataMode:context.dataMode};
}

export async function listTokenization(context:CommerceContext){
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.listTokenizationIntents(context.organizationId)}
  context.dataMode="DEMO";let store=globalStore.demoTokenization!.get(context.organizationId);if(!store){store=new Map();globalStore.demoTokenization!.set(context.organizationId,store)}return[...store.values()];
}

export async function createTokenization(context:CommerceContext,input:{energyPositionId:string;network:TokenizationNetwork;amountWh:bigint;idempotencyKey:string}){
  const deContext=digitalContext(context);
  const backing=await getDigitalEnergyPositionBacking(deContext,input.energyPositionId);
  assertTokenizationAmount({amountWh:input.amountWh,availableWh:backing.availableWh});
  const reviewHash=createHash("sha256").update(JSON.stringify({organizationId:context.organizationId,energyPositionId:input.energyPositionId,network:input.network,amountWh:input.amountWh.toString(),standard:"PET-20"})).digest("hex");
  if(commerceDatabaseConfigured()){context.dataMode="LIVE";return globalStore.commerceRepository!.createTokenizationIntent({id:`tok_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,createdBy:context.userId,reviewHash,...input})}
  context.dataMode="DEMO";
  let store=globalStore.demoTokenization!.get(context.organizationId);if(!store){store=new Map();globalStore.demoTokenization!.set(context.organizationId,store)}
  const replay=[...store.values()].find(item=>item.idempotencyKey===input.idempotencyKey);
  if(replay){
    if(replay.energyPositionId!==input.energyPositionId||replay.network!==input.network||BigInt(replay.amountWh)!==input.amountWh)throw Object.assign(new Error("Idempotency key was reused with a different tokenization payload"),{code:"TOKENIZATION_IDEMPOTENCY_CONFLICT"});
    return replay;
  }
  const now=new Date().toISOString();
  const intent={id:`tok_${crypto.randomUUID().replaceAll("-","")}`,organizationId:context.organizationId,createdBy:context.userId,energyPositionId:input.energyPositionId,network:input.network,amountWh:input.amountWh.toString(),state:"DRAFT" as TokenizationIntentState,assetClass:"VERIFIED_ENERGY_POSITION",metadataStandard:"PET-20",reviewHash,idempotencyKey:input.idempotencyKey,createdAt:now,updatedAt:now};
  store.set(intent.id,intent);return intent;
}

export async function tokenizationAction(context:CommerceContext,id:string,next:TokenizationIntentState,payload:{walletReference?:string;chainReference?:string}={}){
  let current:any;
  if(commerceDatabaseConfigured()){
    context.dataMode="LIVE";
    current=await globalStore.commerceRepository!.getTokenizationIntent(context.organizationId,id);
  }else{
    context.dataMode="DEMO";
    current=globalStore.demoTokenization!.get(context.organizationId)?.get(id);
  }
  if(!current)throw Object.assign(new Error("Tokenization intent not found"),{code:"TOKENIZATION_INTENT_NOT_FOUND"});

  if(next==="CONFIRMED"){
    if(!payload.chainReference?.trim())throw Object.assign(new Error("Chain representation reference is required"),{code:"TOKENIZATION_CHAIN_REFERENCE_REQUIRED"});
    const deContext=digitalContext(context);
    const backing=await getDigitalEnergyPositionBacking(deContext,current.energyPositionId);
    assertTokenizationAmount({amountWh:BigInt(current.amountWh),availableWh:backing.availableWh});
    await representDigitalEnergyPosition(deContext,{
      positionId:current.energyPositionId,
      representationId:`rep_${id}`,
      network:current.network,
      reference:payload.chainReference.trim(),
      amountWh:String(current.amountWh),
      idempotencyKey:`tokenization:${id}:confirm`,
    });
  }

  if(commerceDatabaseConfigured()){
    return globalStore.commerceRepository!.transitionTokenization({organizationId:context.organizationId,id,next,...payload});
  }

  const store=globalStore.demoTokenization!.get(context.organizationId)!;
  const {assertTokenizationTransition}=await import("@powerchain/tokenization");
  assertTokenizationTransition(current.state,next);
  if(next==="SUBMITTED"&&!payload.walletReference?.trim())throw Object.assign(new Error("External wallet reference is required"),{code:"TOKENIZATION_WALLET_REFERENCE_REQUIRED"});
  const updated={...current,state:next,...(payload.walletReference?{walletReference:payload.walletReference}:{}),...(payload.chainReference?{chainReference:payload.chainReference}:{}),updatedAt:new Date().toISOString()};
  store.set(id,updated);return updated;
}
