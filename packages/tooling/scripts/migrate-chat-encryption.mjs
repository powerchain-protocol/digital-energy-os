import { createCipheriv,createHash,randomBytes } from "node:crypto";
import pg from "pg";
const {Pool}=pg;
const connectionString=process.env.DATABASE_URL;
const encoded=process.env.POWERCHAIN_CHAT_ENCRYPTION_KEY_B64;
if(!connectionString)throw new Error("DATABASE_URL is required");
if(!encoded)throw new Error("POWERCHAIN_CHAT_ENCRYPTION_KEY_B64 is required");
const key=Buffer.from(encoded,"base64");if(key.length!==32)throw new Error("POWERCHAIN_CHAT_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes");
const pool=new Pool({connectionString,ssl:process.env.POSTGRES_SSL==="true"?{rejectUnauthorized:true}:undefined});
const client=await pool.connect();let migrated=0;
try{await client.query("begin");const rows=await client.query(`select id,content from ai_messages where content is not null and content_ciphertext is null for update`);for(const row of rows.rows){const plaintext=String(row.content),nonce=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,nonce),ciphertext=Buffer.concat([cipher.update(plaintext,"utf8"),cipher.final()]);await client.query(`update ai_messages set content=null,content_ciphertext=$2,content_nonce=$3,content_auth_tag=$4,content_hash=$5,encryption_key_id='chat-aes256gcm-v1' where id=$1`,[row.id,ciphertext.toString("base64"),nonce.toString("base64"),cipher.getAuthTag().toString("base64"),createHash("sha256").update(plaintext).digest("hex")]);migrated++}await client.query("commit");console.log(JSON.stringify({migrated,remainingPlaintext:0},null,2))}catch(error){await client.query("rollback");throw error}finally{client.release();await pool.end()}
