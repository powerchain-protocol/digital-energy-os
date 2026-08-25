import "server-only";
import { getPostgresPool } from "../clients/postgres";
import { EnergyMonitoringRepository } from "./energy-monitoring";

function configured(){return Boolean(process.env.DATABASE_URL?.trim())}
function integer(value:unknown){return Number(value??0)}
export type OperatorWorkspaceDomain="ems"|"erp"|"cmr"|"rewards"|"treasury"|"vault";

export class OperatorWorkspaceRepository{
  readonly mode=configured()?"LIVE":"UNCONFIGURED" as const;
  async overview(organizationId:string,domain:OperatorWorkspaceDomain){
    if(!configured())return{state:"UNCONFIGURED" as const,domain,observedAt:new Date().toISOString(),metrics:[],records:[],reason:"DATABASE_URL is not configured"};
    switch(domain){
      case "ems":return this.ems(organizationId);
      case "erp":return this.erp(organizationId);
      case "cmr":return this.cmr(organizationId);
      case "rewards":return this.rewards(organizationId);
      case "treasury":return this.treasury(organizationId);
      case "vault":return this.vault(organizationId);
    }
  }
  private async ems(organizationId:string){
    const energy=new EnergyMonitoringRepository();
    const[summary,assets,markets]=await Promise.all([
      energy.summary(organizationId),
      getPostgresPool().query(`select count(*)::int count from energy_assets where organization_id=$1`,[organizationId]),
      getPostgresPool().query(`select count(*)::int count,coalesce(sum(available_wh),0)::text available_wh from local_energy_listings where organization_id=$1 and state='ACTIVE'`,[organizationId]),
    ]);
    return{state:"READY" as const,domain:"ems" as const,observedAt:new Date().toISOString(),metrics:[
      {id:"verified-energy",label:"Verified energy",value:summary.verifiedEnergyWh.toString(),unit:"Wh"},
      {id:"assets",label:"Energy assets",value:String(assets.rows[0]?.count??0)},
      {id:"devices",label:"Online devices",value:String(summary.activeDevices)},
      {id:"local-market",label:"Available local energy",value:String(markets.rows[0]?.available_wh??"0"),unit:"Wh"},
    ],records:[],sourceMode:summary.sourceMode};
  }
  private async erp(organizationId:string){
    const[result,recent]=await Promise.all([
      getPostgresPool().query(`select count(*)::int count,count(*) filter(where status='OPEN')::int open,coalesce(sum(amount_minor) filter(where status='OPEN'),0)::text open_amount from erp_documents where organization_id=$1`,[organizationId]),
      getPostgresPool().query(`select id,document_type,external_reference,currency,amount_minor::text amount_minor,status,source_system,created_at from erp_documents where organization_id=$1 order by created_at desc limit 12`,[organizationId]),
    ]);const row=result.rows[0]??{};return{state:"READY" as const,domain:"erp" as const,observedAt:new Date().toISOString(),metrics:[{id:"documents",label:"Documents",value:String(row.count??0)},{id:"open",label:"Open",value:String(row.open??0)},{id:"open-amount",label:"Open amount",value:String(row.open_amount??"0"),unit:"minor units"}],records:recent.rows};
  }
  private async cmr(organizationId:string){
    const[result,recent]=await Promise.all([
      getPostgresPool().query(`select count(*)::int count,count(*) filter(where status='ACTIVE')::int active,count(*) filter(where status='PROSPECT')::int prospects from cmr_relationships where organization_id=$1`,[organizationId]),
      getPostgresPool().query(`select id,participant_id,relationship_type,status,owner_id,tags,updated_at from cmr_relationships where organization_id=$1 order by updated_at desc limit 12`,[organizationId]),
    ]);const row=result.rows[0]??{};return{state:"READY" as const,domain:"cmr" as const,observedAt:new Date().toISOString(),metrics:[{id:"relationships",label:"Relationships",value:String(row.count??0)},{id:"active",label:"Active",value:String(row.active??0)},{id:"prospects",label:"Prospects",value:String(row.prospects??0)}],records:recent.rows};
  }
  private async rewards(organizationId:string){
    const[result,recent]=await Promise.all([
      getPostgresPool().query(`select count(*)::int count,count(*) filter(where state='CLAIMABLE')::int claimable,coalesce(sum(pwrc_raw),0)::text total_pwrc_raw from reward_allocations where organization_id=$1`,[organizationId]),
      getPostgresPool().query(`select id,participant_id,epoch,reason,pwrc_raw::text pwrc_raw,evidence_ids,state,created_at from reward_allocations where organization_id=$1 order by created_at desc limit 12`,[organizationId]),
    ]);const row=result.rows[0]??{};return{state:"READY" as const,domain:"rewards" as const,observedAt:new Date().toISOString(),metrics:[{id:"allocations",label:"Allocations",value:String(row.count??0)},{id:"claimable",label:"Claimable",value:String(row.claimable??0)},{id:"pwrc",label:"Allocated PWRC raw",value:String(row.total_pwrc_raw??"0")}],records:recent.rows};
  }
  private async treasury(organizationId:string){
    const[accounts,journals]=await Promise.all([
      getPostgresPool().query(`select id,code,name,account_type,asset,balance_raw::text balance_raw,status,version from treasury_accounts where organization_id=$1 order by code,asset limit 50`,[organizationId]),
      getPostgresPool().query(`select id,business_reference,journal_type,source_journal_id,reason,posted_at from treasury_journals where organization_id=$1 order by posted_at desc limit 12`,[organizationId]),
    ]);
    const assets=new Map<string,bigint>();for(const row of accounts.rows)assets.set(String(row.asset),(assets.get(String(row.asset))??0n)+BigInt(String(row.balance_raw)));
    return{state:"READY" as const,domain:"treasury" as const,observedAt:new Date().toISOString(),metrics:[{id:"accounts",label:"Accounts",value:String(accounts.rows.length)},{id:"journals",label:"Recent journals",value:String(journals.rows.length)},...Array.from(assets.entries()).slice(0,3).map(([asset,value])=>({id:`balance-${asset}`,label:`${asset} net balance`,value:value.toString(),unit:"raw"}))],records:accounts.rows,recentJournals:journals.rows};
  }
  private async vault(organizationId:string){
    const[result,recent]=await Promise.all([
      getPostgresPool().query(`select count(*)::int count,count(distinct classification)::int classes from vault_records where organization_id=$1`,[organizationId]),
      getPostgresPool().query(`select id,classification,content_hash,storage_reference,retention_policy,created_at from vault_records where organization_id=$1 order by created_at desc limit 12`,[organizationId]),
    ]);const row=result.rows[0]??{};return{state:"READY" as const,domain:"vault" as const,observedAt:new Date().toISOString(),metrics:[{id:"records",label:"Vault records",value:String(row.count??0)},{id:"classes",label:"Classifications",value:String(row.classes??0)}],records:recent.rows};
  }
}
