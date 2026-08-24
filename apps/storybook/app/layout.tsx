import type { ReactNode } from "react";
import "./styles.css";

export const metadata = {
  title: "PowerChain Component Catalog",
  description: "Security-hardened first-party component reference for PowerChain Digital Energy OS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
