import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");

test("tokenized chat persistence enforces one settled 10k PWRC message unit",()=>{
 const migration=read("packages/database/prisma/migrations/20260829000100_tokenized_chat_proofs/migration.sql");
 assert.match(migration,/pwrc_base_units=10000000000000/);
 assert.match(migration,/pwrc_debit_base_units=10000000000000/);
 assert.match(migration,/token_proof_hash.*UNIQUE|token_proof_hash_unique/s);
 assert.match(migration,/chat_receipts_hash_lookup_idx/);
 assert.match(migration,/SETTLED/);
});

test("tokenized chat API aliases delegate to canonical proof and credit handlers",()=>{
 const canonicalCredit="apps/platform/src/app/api/v1/chat/conversations/[conversationId]/credits/route.ts";
 const canonicalProof="apps/platform/src/app/api/v1/chat/conversations/[conversationId]/messages/[messageId]/proof/route.ts";
 assert.ok(fs.existsSync(canonicalCredit));assert.ok(fs.existsSync(canonicalProof));
 for(const alias of ["capilot","capilot-mobile","copilot-mobile"]){
  const credit=read(`apps/platform/src/app/api/v1/${alias}/conversations/[conversationId]/credits/route.ts`);
  const proof=read(`apps/platform/src/app/api/v1/${alias}/conversations/[conversationId]/messages/[messageId]/proof/route.ts`);
  assert.match(credit,/chat\/conversations\/\[conversationId\]\/credits\/route/);
  assert.match(proof,/chat\/conversations\/\[conversationId\]\/messages\/\[messageId\]\/proof\/route/);
 }
});

test("new chat writes require encrypted persistence and signed receipts",()=>{
 const service=read("apps/platform/src/lib/chat/tokenized-chat-service.ts");
 assert.match(service,/aes-256-gcm/);
 assert.match(service,/POWERCHAIN_CHAT_ENCRYPTION_KEY_B64/);
 assert.match(service,/POWERCHAIN_CHAT_RECEIPT_SIGNING_KEY_B64/);
 assert.match(service,/settleAssistant/);
 assert.doesNotMatch(read("apps/platform/src/app/api/v1/chat/route.ts"),/chat-store/);
});
