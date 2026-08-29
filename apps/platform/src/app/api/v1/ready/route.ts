import { getPostgresPool } from "@powerchain/database/clients/postgres";
import { PLATFORM_VERSION } from "@/config/release";
import { getPowerChainPrograms } from "@/lib/server/powerchain-api";

export const dynamic="force-dynamic";

async function databaseCheck(){
  if(!process.env.DATABASE_URL?.trim())return{state:"UNCONFIGURED" as const,required:process.env.NODE_ENV==="production"};
  try{
    const started=Date.now();
    await getPostgresPool().query("select 1");
    return{state:"READY" as const,required:true,latencyMs:Date.now()-started};
  }catch(error){
    return{state:"ERROR" as const,required:true,error:error instanceof Error?error.message:"Database readiness failed"};
  }
}


async function tokenizedChatCheck(){
  const required=process.env.NODE_ENV==="production";
  const encryption=Boolean(process.env.POWERCHAIN_CHAT_ENCRYPTION_KEY_B64?.trim());
  const signing=Boolean(process.env.POWERCHAIN_CHAT_RECEIPT_SIGNING_KEY_B64?.trim());
  if(!process.env.DATABASE_URL?.trim())return{state:"UNCONFIGURED" as const,required,encryptionConfigured:encryption,signingConfigured:signing};
  try{
    const result=await getPostgresPool().query<{plaintext:string}>(`select count(*)::text plaintext from ai_messages where content is not null and content_ciphertext is null`);
    const plaintext=Number(result.rows[0]?.plaintext??0);
    const state=encryption&&signing&&plaintext===0?"READY" as const:"BLOCKED" as const;
    return{state,required,encryptionConfigured:encryption,signingConfigured:signing,legacyPlaintextMessages:plaintext};
  }catch(error){return{state:"ERROR" as const,required,error:error instanceof Error?error.message:"Tokenized chat readiness failed"};}
}

export async function GET(){
  const database=await databaseCheck();
  const programs=await getPowerChainPrograms();
  const tokenizedChat=await tokenizedChatCheck();
  const checks={
    runtime:{state:"READY" as const,version:PLATFORM_VERSION},
    database,
    solana:{state:(process.env.SOLANA_RPC_URL||process.env.HELIUS_RPC_URL||process.env.SOLANA_DEVNET_RPC_URL||process.env.SOLANA_MAINNET_RPC_URL)?"CONFIGURED":"PUBLIC_FALLBACK"},
    powerchainPrograms:{state:programs.configured>0?"CONFIGURED":"UNCONFIGURED",configured:programs.configured,total:programs.total},
    tokenizedChat,
  };
  const ready=database.state!=="ERROR"&&!(database.required&&database.state==="UNCONFIGURED")&&!(tokenizedChat.required&&tokenizedChat.state!=="READY");
  return Response.json({ok:ready,ready,service:"powerchain-platform",version:PLATFORM_VERSION,checks,observedAt:new Date().toISOString()},{status:ready?200:503,headers:{"cache-control":"no-store"}});
}
