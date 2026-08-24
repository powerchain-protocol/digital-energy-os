"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";
import { GlobalCopilot } from "./copilot/global-copilot";
import { CommerceProvider } from "@/features/commerce/context/commerce-context";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar />
      <CommerceProvider>
        <div className="app-workspace">
          <Header />
          <main className="app-main" id="main-content" tabIndex={-1}>
            <div className="app-content">{children}</div>
          </main>
          <Footer />
          <GlobalCopilot />
        </div>
      </CommerceProvider>
    </div>
  );
}
