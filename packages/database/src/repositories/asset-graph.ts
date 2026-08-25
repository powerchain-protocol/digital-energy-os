import "server-only";
import { createHash } from "node:crypto";
import { getPostgresPool } from "../clients/postgres";
import { assertGraphTenant,type AssetGraphSnapshot,type AssetGraphNode,type AssetRelationship } from "@powerchain/asset-graph";

function configured(){return Boolean(process.env.DATABASE_URL?.trim())}
function edgeId(parts:string[]){return `edge_${createHash("sha256").update(parts.join(":"),"utf8").digest("hex").slice(0,24)}`}

export class AssetGraphRepository{
  async snapshot(organizationId:string):Promise<AssetGraphSnapshot>{
    if(!configured())return{organizationId,nodes:[],relationships:[],provenance:[],observedAt:new Date().toISOString()};
    const pool=getPostgresPool();
    const [org,assets,devices]=await Promise.all([
      pool.query(`select id,name,updated_at from organizations where id=$1 limit 1`,[organizationId]),
      pool.query(`select id,name,type,status,capacity_mw::text capacity_mw,metadata,updated_at from energy_assets where organization_id=$1 order by name`,[organizationId]),
      pool.query(`select id,device_id,asset_id,kind,manufacturer,model,status,network,health_score,last_seen_at,metadata,updated_at from connected_devices where organization_id=$1 order by device_id`,[organizationId]),
    ]);
    const now=new Date().toISOString();
    const nodes:AssetGraphNode[]=[];
    const relationships:AssetRelationship[]=[];
    if(org.rows[0])nodes.push({id:`org:${organizationId}`,organizationId,type:"ORGANIZATION",label:String(org.rows[0].name),metadata:{},version:1,updatedAt:new Date(org.rows[0].updated_at??Date.now()).toISOString()});
    for(const row of assets.rows){
      const id=`asset:${row.id}`;
      nodes.push({id,organizationId,type:"ASSET",label:String(row.name),metadata:{assetId:String(row.id),type:String(row.type),status:String(row.status),capacityMw:String(row.capacity_mw),...(row.metadata&&typeof row.metadata==="object"?row.metadata:{})},version:1,updatedAt:new Date(row.updated_at).toISOString()});
      relationships.push({id:edgeId([organizationId,"OWNS",id]),organizationId,from:`org:${organizationId}`,to:id,type:"OWNS",evidenceIds:[],validFrom:now});
    }
    for(const row of devices.rows){
      const id=`device:${row.id}`;
      nodes.push({id,organizationId,type:row.kind==="SMART_METER"?"METER":"DEVICE",label:`${row.manufacturer} ${row.model}`.trim(),metadata:{deviceId:String(row.device_id),kind:String(row.kind),status:String(row.status),network:String(row.network),healthScore:Number(row.health_score),lastSeenAt:row.last_seen_at?new Date(row.last_seen_at).toISOString():null,...(row.metadata&&typeof row.metadata==="object"?row.metadata:{})},version:1,updatedAt:new Date(row.updated_at).toISOString()});
      if(row.asset_id){const assetId=`asset:${row.asset_id}`;relationships.push({id:edgeId([assetId,"CONNECTED_TO",id]),organizationId,from:assetId,to:id,type:"CONNECTED_TO",evidenceIds:[],validFrom:now});}
      else relationships.push({id:edgeId([`org:${organizationId}`,"MONITORS",id]),organizationId,from:`org:${organizationId}`,to:id,type:"MONITORS",evidenceIds:[],validFrom:now});
    }
    const snapshot={organizationId,nodes,relationships,provenance:[],observedAt:now};assertGraphTenant(snapshot,organizationId);return snapshot;
  }
}
