"use client";
import type { ChatMessage } from "@/types/ai/chat";
import { TokenizedResponseProof } from "./tokenized-response-proof";
export function MessageBubble({message}:{message:ChatMessage}){const mine=message.role==="user";return <article className={`min-w-0 max-w-[92%] rounded-2xl px-4 py-3 text-sm sm:max-w-[85%] ${mine?"ml-auto bg-emerald-800 text-white":"bg-[var(--surface)] border border-[var(--border)]"}`}><p className="whitespace-pre-wrap break-words">{message.content}</p>{!mine&&message.tokenizedProof&&<TokenizedResponseProof proof={message.tokenizedProof} conversationId={message.chatId} messageId={message.id}/>}<time className="mt-2 block text-[10px] opacity-70">{new Date(message.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></article>}
