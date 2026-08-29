import test from "node:test";
import assert from "node:assert/strict";
import {createCanonicalChatQuote,createTokenizedChatProof,hashCanonical,tokenizedChatProofHash,CHAT_MESSAGE_UNIT_BASE_UNITS} from "../../credits/src/tokenized-chat.ts";

test("tokenized chat quote is deterministic",()=>{
 const input={conversationId:"chat-1",userId:"user-1",requestId:"req-1",createdAt:"2026-08-29T00:00:00.000Z",expiresAt:"2026-08-29T00:02:00.000Z"};
 assert.equal(hashCanonical(createCanonicalChatQuote(input)),hashCanonical(createCanonicalChatQuote(input)));
 assert.equal(CHAT_MESSAGE_UNIT_BASE_UNITS,"10000000000000");
});

test("settled proof is deterministic and explicitly non-transferable",()=>{
 const proof=createTokenizedChatProof({conversationId:"chat-1",messageId:"msg-1",quoteHash:"q".repeat(64),reservationId:"res-1",responseId:"msg-1",responseHash:"r".repeat(64),receiptId:"rcpt-1",receiptHash:"h".repeat(64),messageUnitId:"unit-1"});
 assert.equal(proof.settlementStatus,"SETTLED");
 assert.equal(proof.transferable,false);
 assert.equal(proof.mintedAsset,false);
 assert.equal(proof.financialInstrument,false);
 assert.equal(tokenizedChatProofHash(proof),tokenizedChatProofHash({...proof}));
});
