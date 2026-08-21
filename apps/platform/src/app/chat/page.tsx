"use client";

import { Shell } from "@/components/shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ChatPage() {
  return (
    <Shell>
      <SectionHeading eyebrow="AI workspace" title="Renewables copilot" description="Analyze energy operations, market conditions, tokenomics and PowerChain infrastructure with GRIDLLM." className="mb-5" />
      <ChatInterface />
    </Shell>
  );
}
