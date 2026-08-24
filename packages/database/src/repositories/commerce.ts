import "server-only";
import type { QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import { calculateCheckoutTotals, type CheckoutCurrency, type CheckoutLineInput } from "@powerchain/checkout";
import { assertTokenizationTransition, type TokenizationIntentState, type TokenizationNetwork } from "@powerchain/tokenization";

type ListingStatus="DRAFT"|"ACTIVE"|"PAUSED"|"SOLD_OUT"|"CLOSED";
type OrderStatus="RESERVED"|"CHECKOUT_PENDING"|"PAID"|"CANCELLED"|"EXPIRED";
type CheckoutStatus="CREATED"|"REVIEW"|"PENDING_SIGNATURE"|"SUBMITTED"|"CONFIRMED"|"CANCELLED"|"EXPIRED";

interface ListingRow extends QueryResultRow{
  id:string;organization_id:string;seller_id:string;slug:string;title:string;description:string;category:string;source:string|null;location:string|null;
  currency:CheckoutCurrency;unit_amount_minor:string;inventory:number;remaining:number;status:ListingStatus;metadata:Record<string,unknown>;created_at:Date;updated_at:Date;
}
interface OrderRow extends QueryResultRow{
  id:string;organization_id:string;listing_id:string;buyer_id:string;quantity:number;amount_minor:string;currency:CheckoutCurrency;status:OrderStatus;
  checkout_session_id:string|null;idempotency_key:string;created_at:Date;updated_at:Date;
}
interface CheckoutRow extends QueryResultRow{
  id:string;organization_id:string;user_id:string;currency:CheckoutCurrency;status:CheckoutStatus;lines:CheckoutLineInput[];
  subtotal_minor:string;service_fee_minor:string;network_fee_minor:string|null;total_minor:string;payer_wallet:string|null;return_url:string|null;settlement_signature:string|null;
  idempotency_key:string;expires_at:Date;created_at:Date;updated_at:Date;
}
interface TokenizationRow extends QueryResultRow{
  id:string;organization_id:string;created_by:string;energy_position_id:string;network:TokenizationNetwork;amount_wh:string;state:TokenizationIntentState;
  asset_class:"VERIFIED_ENERGY_POSITION";metadata_standard:"PET-20";review_hash:string;wallet_reference:string|null;chain_reference:string|null;idempotency_key:string;created_at:Date;updated_at:Date;
}

const mapListing=(row:ListingRow)=>({
  id:row.id,organizationId:row.organization_id,sellerId:row.seller_id,slug:row.slug,title:row.title,description:row.description,category:row.category,
  source:row.source,location:row.location,currency:row.currency,unitAmountMinor:row.unit_amount_minor,inventory:row.inventory,remaining:row.remaining,
  status:row.status.toLowerCase(),metadata:row.metadata??{},createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString(),
});
const mapOrder=(row:OrderRow)=>({
  id:row.id,organizationId:row.organization_id,listingId:row.listing_id,buyerId:row.buyer_id,quantity:row.quantity,amountMinor:row.amount_minor,
  currency:row.currency,status:row.status.toLowerCase(),checkoutSessionId:row.checkout_session_id??undefined,idempotencyKey:row.idempotency_key,
  createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString(),
});
const mapCheckout=(row:CheckoutRow)=>({
  id:row.id,organizationId:row.organization_id,userId:row.user_id,currency:row.currency,status:row.status.toLowerCase(),lines:row.lines,
  totals:{subtotalMinor:row.subtotal_minor,serviceFeeMinor:row.service_fee_minor,networkFeeMinor:row.network_fee_minor,totalMinor:row.total_minor},
  payerWallet:row.payer_wallet??undefined,returnUrl:row.return_url??undefined,settlementSignature:row.settlement_signature??undefined,
  idempotencyKey:row.idempotency_key,expiresAt:new Date(row.expires_at).toISOString(),createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString(),
});
const mapTokenization=(row:TokenizationRow)=>({
  id:row.id,organizationId:row.organization_id,createdBy:row.created_by,energyPositionId:row.energy_position_id,network:row.network,amountWh:row.amount_wh,state:row.state,
  assetClass:row.asset_class,metadataStandard:row.metadata_standard,reviewHash:row.review_hash,walletReference:row.wallet_reference??undefined,
  chainReference:row.chain_reference??undefined,idempotencyKey:row.idempotency_key,createdAt:new Date(row.created_at).toISOString(),updatedAt:new Date(row.updated_at).toISOString(),
});

export class PostgresCommerceRepository{
  async listMarketplaceListings(organizationId:string,query="",limit=100){
    const result=await getPostgresPool().query<ListingRow>(`
      select * from marketplace_listings
      where organization_id=$1 and status='ACTIVE' and remaining>0
        and ($2='' or lower(slug||' '||title||' '||description||' '||coalesce(source,'')||' '||coalesce(location,'')) like '%'||lower($2)||'%')
      order by updated_at desc limit $3
    `,[organizationId,query.trim(),Math.max(1,Math.min(limit,250))]);
    return result.rows.map(mapListing);
  }

  async getMarketplaceListing(organizationId:string,id:string){
    const result=await getPostgresPool().query<ListingRow>(`select * from marketplace_listings where organization_id=$1 and id=$2`,[organizationId,id]);
    return result.rows[0]?mapListing(result.rows[0]):null;
  }

  async getMarketplaceListingBySlug(organizationId:string,slug:string){
    const result=await getPostgresPool().query<ListingRow>(`select * from marketplace_listings where organization_id=$1 and slug=$2`,[organizationId,slug]);
    return result.rows[0]?mapListing(result.rows[0]):null;
  }

  async createMarketplaceListing(input:{
    id:string;organizationId:string;sellerId:string;slug:string;title:string;description:string;category:string;source?:string;location?:string;
    currency:CheckoutCurrency;unitAmountMinor:string;inventory:number;metadata?:Record<string,unknown>;
  }){
    if(!/^\d+$/.test(input.unitAmountMinor)||BigInt(input.unitAmountMinor)<=0n)throw Object.assign(new Error("Marketplace unit amount must be a positive integer string"),{code:"MARKETPLACE_AMOUNT_INVALID"});
    if(!Number.isSafeInteger(input.inventory)||input.inventory<1)throw Object.assign(new Error("Marketplace inventory must be positive"),{code:"MARKETPLACE_INVENTORY_INVALID"});
    const result=await getPostgresPool().query<ListingRow>(`
      insert into marketplace_listings
      (id,organization_id,seller_id,slug,title,description,category,source,location,currency,unit_amount_minor,inventory,remaining,status,metadata)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,'DRAFT',$13::jsonb)
      returning *
    `,[input.id,input.organizationId,input.sellerId,input.slug,input.title,input.description,input.category,input.source??null,input.location??null,input.currency,input.unitAmountMinor,input.inventory,JSON.stringify(input.metadata??{})]);
    return mapListing(result.rows[0]!);
  }

  async activateMarketplaceListing(organizationId:string,id:string){
    const result=await getPostgresPool().query<ListingRow>(`
      update marketplace_listings set status='ACTIVE',updated_at=now()
      where organization_id=$1 and id=$2 and status in ('DRAFT','PAUSED') returning *
    `,[organizationId,id]);
    if(!result.rows[0])throw Object.assign(new Error("Marketplace listing cannot be activated"),{code:"MARKETPLACE_LISTING_STATE_INVALID"});
    return mapListing(result.rows[0]);
  }

  async reserveMarketplaceOrder(input:{id:string;organizationId:string;listingId:string;buyerId:string;quantity:number;idempotencyKey:string}){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock(hashtext($1),hashtext($2))",[input.organizationId,`marketplace:${input.listingId}`]);

      const replay=await client.query<OrderRow>(`select * from marketplace_orders where organization_id=$1 and idempotency_key=$2`,[input.organizationId,input.idempotencyKey]);
      if(replay.rows[0]){
        const row=replay.rows[0];
        if(row.listing_id!==input.listingId||row.quantity!==input.quantity||row.buyer_id!==input.buyerId)throw Object.assign(new Error("Idempotency key was reused with a different marketplace order payload"),{code:"MARKETPLACE_IDEMPOTENCY_CONFLICT"});
        await client.query("commit");return mapOrder(row);
      }

      const listing=await client.query<ListingRow>(`select * from marketplace_listings where organization_id=$1 and id=$2 for update`,[input.organizationId,input.listingId]);
      const source=listing.rows[0];
      if(!source)throw Object.assign(new Error("Marketplace listing not found"),{code:"MARKETPLACE_LISTING_NOT_FOUND"});
      if(source.status!=="ACTIVE")throw Object.assign(new Error("Marketplace listing is not active"),{code:"MARKETPLACE_LISTING_UNAVAILABLE"});
      if(!Number.isSafeInteger(input.quantity)||input.quantity<1||input.quantity>source.remaining)throw Object.assign(new Error("Requested quantity is unavailable"),{code:"MARKETPLACE_QUANTITY_UNAVAILABLE"});

      const amountMinor=(BigInt(source.unit_amount_minor)*BigInt(input.quantity)).toString();
      const order=await client.query<OrderRow>(`
        insert into marketplace_orders(id,organization_id,listing_id,buyer_id,quantity,amount_minor,currency,status,idempotency_key)
        values($1,$2,$3,$4,$5,$6,$7,'RESERVED',$8) returning *
      `,[input.id,input.organizationId,input.listingId,input.buyerId,input.quantity,amountMinor,source.currency,input.idempotencyKey]);
      const remaining=source.remaining-input.quantity;
      await client.query(`update marketplace_listings set remaining=$3,status=case when $3=0 then 'SOLD_OUT'::"MarketplaceListingStatus" else status end,updated_at=now() where organization_id=$1 and id=$2`,[input.organizationId,input.listingId,remaining]);
      await client.query("commit");
      return mapOrder(order.rows[0]!);
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async getMarketplaceOrder(organizationId:string,id:string){
    const result=await getPostgresPool().query<OrderRow>(`select * from marketplace_orders where organization_id=$1 and id=$2`,[organizationId,id]);
    return result.rows[0]?mapOrder(result.rows[0]):null;
  }

  async listMarketplaceOrders(organizationId:string,limit=100){
    const result=await getPostgresPool().query<OrderRow>(`select * from marketplace_orders where organization_id=$1 order by updated_at desc limit $2`,[organizationId,Math.max(1,Math.min(limit,500))]);
    return result.rows.map(mapOrder);
  }

  async cancelMarketplaceOrder(input:{organizationId:string;orderId:string}){
    const client=await getPostgresPool().connect();
    try{
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock(hashtext($1),hashtext($2))",[input.organizationId,`marketplace-order:${input.orderId}`]);
      const orderResult=await client.query<OrderRow>(`select * from marketplace_orders where organization_id=$1 and id=$2 for update`,[input.organizationId,input.orderId]);
      const order=orderResult.rows[0];
      if(!order)throw Object.assign(new Error("Marketplace order not found"),{code:"MARKETPLACE_ORDER_NOT_FOUND"});
      if(order.status==="CANCELLED"){await client.query("commit");return mapOrder(order)}
      if(order.status==="PAID")throw Object.assign(new Error("Paid marketplace orders cannot be cancelled through reservation release"),{code:"MARKETPLACE_ORDER_STATE_INVALID"});
      if(order.status==="EXPIRED"){await client.query("commit");return mapOrder(order)}
      const listingResult=await client.query<ListingRow>(`select * from marketplace_listings where organization_id=$1 and id=$2 for update`,[input.organizationId,order.listing_id]);
      const listing=listingResult.rows[0];
      if(!listing)throw Object.assign(new Error("Marketplace listing not found"),{code:"MARKETPLACE_LISTING_NOT_FOUND"});
      const restored=Math.min(listing.inventory,listing.remaining+order.quantity);
      await client.query(`update marketplace_listings set remaining=$3,status=case when status='SOLD_OUT' then 'ACTIVE'::"MarketplaceListingStatus" else status end,updated_at=now() where organization_id=$1 and id=$2`,[input.organizationId,listing.id,restored]);
      const updated=await client.query<OrderRow>(`update marketplace_orders set status='CANCELLED',updated_at=now() where organization_id=$1 and id=$2 returning *`,[input.organizationId,input.orderId]);
      await client.query("commit");
      return mapOrder(updated.rows[0]!);
    }catch(error){await client.query("rollback");throw error}finally{client.release()}
  }

  async attachCheckout(input:{organizationId:string;orderId:string;checkoutSessionId:string}){
    const result=await getPostgresPool().query<OrderRow>(`
      update marketplace_orders set checkout_session_id=$3,status='CHECKOUT_PENDING',updated_at=now()
      where organization_id=$1 and id=$2 and status='RESERVED' returning *
    `,[input.organizationId,input.orderId,input.checkoutSessionId]);
    if(!result.rows[0])throw Object.assign(new Error("Marketplace order is not reservable for checkout"),{code:"MARKETPLACE_ORDER_STATE_INVALID"});
    return mapOrder(result.rows[0]);
  }

  async markMarketplacePaid(input:{organizationId:string;orderId:string;checkoutSessionId:string}){
    const result=await getPostgresPool().query<OrderRow>(`
      update marketplace_orders set status='PAID',updated_at=now()
      where organization_id=$1 and id=$2 and status='CHECKOUT_PENDING' and checkout_session_id=$3 returning *
    `,[input.organizationId,input.orderId,input.checkoutSessionId]);
    if(!result.rows[0])throw Object.assign(new Error("Marketplace order checkout does not match"),{code:"MARKETPLACE_ORDER_CHECKOUT_INVALID"});
    return mapOrder(result.rows[0]);
  }

  async createCheckout(input:{id:string;organizationId:string;userId:string;currency:CheckoutCurrency;lines:CheckoutLineInput[];returnUrl?:string;idempotencyKey:string;ttlMinutes?:number}){
    const totals=calculateCheckoutTotals(input.lines);
    const pool=getPostgresPool();
    const replay=await pool.query<CheckoutRow>(`select * from checkout_sessions where organization_id=$1 and idempotency_key=$2`,[input.organizationId,input.idempotencyKey]);
    if(replay.rows[0]){
      const row=replay.rows[0];
      const same=row.user_id===input.userId&&row.currency===input.currency&&JSON.stringify(row.lines)===JSON.stringify(input.lines);
      if(!same)throw Object.assign(new Error("Idempotency key was reused with a different checkout payload"),{code:"CHECKOUT_IDEMPOTENCY_CONFLICT"});
      return mapCheckout(row);
    }
    const now=new Date(),expiresAt=new Date(now.getTime()+(input.ttlMinutes??30)*60_000);
    const result=await pool.query<CheckoutRow>(`
      insert into checkout_sessions
      (id,organization_id,user_id,currency,status,lines,subtotal_minor,service_fee_minor,network_fee_minor,total_minor,return_url,idempotency_key,expires_at)
      values($1,$2,$3,$4,'CREATED',$5::jsonb,$6,$7,$8,$9,$10,$11,$12) returning *
    `,[input.id,input.organizationId,input.userId,input.currency,JSON.stringify(input.lines),totals.subtotalMinor,totals.serviceFeeMinor,totals.networkFeeMinor,totals.totalMinor,input.returnUrl??null,input.idempotencyKey,expiresAt]);
    return mapCheckout(result.rows[0]!);
  }

  async listCheckouts(organizationId:string,limit=100){
    const result=await getPostgresPool().query<CheckoutRow>(`select * from checkout_sessions where organization_id=$1 order by updated_at desc limit $2`,[organizationId,Math.max(1,Math.min(limit,250))]);
    return result.rows.map(mapCheckout);
  }

  async getCheckout(organizationId:string,id:string){
    const result=await getPostgresPool().query<CheckoutRow>(`select * from checkout_sessions where organization_id=$1 and id=$2`,[organizationId,id]);
    if(!result.rows[0])return null;
    const row=result.rows[0];
    if(!["CONFIRMED","CANCELLED","EXPIRED"].includes(row.status)&&new Date(row.expires_at).getTime()<=Date.now()){
      const expired=await getPostgresPool().query<CheckoutRow>(`update checkout_sessions set status='EXPIRED',updated_at=now() where organization_id=$1 and id=$2 returning *`,[organizationId,id]);
      return mapCheckout(expired.rows[0]!);
    }
    return mapCheckout(row);
  }

  async transitionCheckout(input:{organizationId:string;id:string;next:CheckoutStatus;payerWallet?:string;settlementSignature?:string}){
    const allowed:Record<CheckoutStatus,CheckoutStatus[]>={
      CREATED:["REVIEW","CANCELLED"],REVIEW:["PENDING_SIGNATURE","CANCELLED"],PENDING_SIGNATURE:["SUBMITTED","CANCELLED"],
      SUBMITTED:["CONFIRMED"],CONFIRMED:[],CANCELLED:[],EXPIRED:[]
    };
    const current=await this.getCheckout(input.organizationId,input.id);
    if(!current)throw Object.assign(new Error("Checkout session not found"),{code:"CHECKOUT_SESSION_NOT_FOUND"});
    const state=current.status.toUpperCase() as CheckoutStatus;
    if(!allowed[state].includes(input.next))throw Object.assign(new Error(`Checkout transition ${state}->${input.next} is invalid`),{code:"CHECKOUT_STATE_INVALID"});
    if(input.next==="PENDING_SIGNATURE"&&!input.payerWallet?.trim())throw Object.assign(new Error("Payer wallet is required"),{code:"CHECKOUT_WALLET_REQUIRED"});
    if(input.next==="SUBMITTED"&&(!input.settlementSignature||input.settlementSignature.trim().length<32))throw Object.assign(new Error("External wallet signature is required"),{code:"CHECKOUT_SIGNATURE_REQUIRED"});
    if(input.next==="CONFIRMED"&&(!input.settlementSignature||input.settlementSignature!==current.settlementSignature))throw Object.assign(new Error("Settlement signature must match the submitted external signature"),{code:"CHECKOUT_SETTLEMENT_MISMATCH"});
    const result=await getPostgresPool().query<CheckoutRow>(`
      update checkout_sessions set status=$3,payer_wallet=coalesce($4,payer_wallet),settlement_signature=coalesce($5,settlement_signature),updated_at=now()
      where organization_id=$1 and id=$2 and status=$6 returning *
    `,[input.organizationId,input.id,input.next,input.payerWallet??null,input.settlementSignature??null,state]);
    if(!result.rows[0])throw Object.assign(new Error("Concurrent checkout transition detected"),{code:"CHECKOUT_CONFLICT"});
    return mapCheckout(result.rows[0]);
  }

  async getTokenizationIntent(organizationId:string,id:string){
    const result=await getPostgresPool().query<TokenizationRow>(`select * from tokenization_intents where organization_id=$1 and id=$2`,[organizationId,id]);
    return result.rows[0]?mapTokenization(result.rows[0]):null;
  }

  async listTokenizationIntents(organizationId:string,limit=100){
    const result=await getPostgresPool().query<TokenizationRow>(`select * from tokenization_intents where organization_id=$1 order by updated_at desc limit $2`,[organizationId,Math.max(1,Math.min(limit,250))]);
    return result.rows.map(mapTokenization);
  }

  async createTokenizationIntent(input:{id:string;organizationId:string;createdBy:string;energyPositionId:string;network:TokenizationNetwork;amountWh:bigint;reviewHash:string;idempotencyKey:string}){
    const pool=getPostgresPool();
    const replay=await pool.query<TokenizationRow>(`select * from tokenization_intents where organization_id=$1 and idempotency_key=$2`,[input.organizationId,input.idempotencyKey]);
    if(replay.rows[0]){
      const row=replay.rows[0];
      if(row.energy_position_id!==input.energyPositionId||row.network!==input.network||BigInt(row.amount_wh)!==input.amountWh)throw Object.assign(new Error("Idempotency key was reused with a different tokenization payload"),{code:"TOKENIZATION_IDEMPOTENCY_CONFLICT"});
      return mapTokenization(row);
    }
    const result=await pool.query<TokenizationRow>(`
      insert into tokenization_intents(id,organization_id,created_by,energy_position_id,network,amount_wh,state,review_hash,idempotency_key)
      values($1,$2,$3,$4,$5,$6,'DRAFT',$7,$8) returning *
    `,[input.id,input.organizationId,input.createdBy,input.energyPositionId,input.network,input.amountWh.toString(),input.reviewHash,input.idempotencyKey]);
    return mapTokenization(result.rows[0]!);
  }

  async transitionTokenization(input:{organizationId:string;id:string;next:TokenizationIntentState;walletReference?:string;chainReference?:string}){
    const currentResult=await getPostgresPool().query<TokenizationRow>(`select * from tokenization_intents where organization_id=$1 and id=$2`,[input.organizationId,input.id]);
    const current=currentResult.rows[0];
    if(!current)throw Object.assign(new Error("Tokenization intent not found"),{code:"TOKENIZATION_INTENT_NOT_FOUND"});
    try{assertTokenizationTransition(current.state,input.next)}catch(error){throw Object.assign(error instanceof Error?error:new Error("Invalid tokenization transition"),{code:"TOKENIZATION_STATE_INVALID"})}
    if(input.next==="SUBMITTED"&&!input.walletReference?.trim())throw Object.assign(new Error("External wallet reference is required before submission"),{code:"TOKENIZATION_WALLET_REFERENCE_REQUIRED"});
    if(input.next==="CONFIRMED"&&!input.chainReference?.trim())throw Object.assign(new Error("On-chain representation reference is required before confirmation"),{code:"TOKENIZATION_CHAIN_REFERENCE_REQUIRED"});
    const result=await getPostgresPool().query<TokenizationRow>(`
      update tokenization_intents set state=$3,wallet_reference=coalesce($4,wallet_reference),chain_reference=coalesce($5,chain_reference),updated_at=now()
      where organization_id=$1 and id=$2 and state=$6 returning *
    `,[input.organizationId,input.id,input.next,input.walletReference??null,input.chainReference??null,current.state]);
    if(!result.rows[0])throw Object.assign(new Error("Concurrent tokenization update detected"),{code:"TOKENIZATION_CONFLICT"});
    return mapTokenization(result.rows[0]);
  }
}
