import { Download, FileJson, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/shell";
export default function PostmanPage(){
  return <Shell><div className="content-container space-y-6">
    <header className="rounded-[28px] border border-slate-800 bg-gradient-to-br from-[#050807] via-[#0b271c] to-[#0b6b45] p-7 text-white"><span className="eyebrow text-emerald-300">API TOOLING · POSTMAN</span><h1 className="mt-3 text-4xl font-semibold tracking-tight">Import the canonical PowerChain /api/v1 collection.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">Explorer, Marketplace, Checkout, Tokenization and Local Energy requests are grouped with idempotency headers and review-first examples.</p></header>
    <section className="grid gap-4 md:grid-cols-2">
      <a download href="/postman/PowerChain-Digital-Energy-OS-v1.0.0.postman_collection.json" className="dashboard-panel block"><FileJson className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">Postman Collection</h2><p className="mt-2 text-sm text-[var(--muted)]">PowerChain Digital Energy OS v1.0.0 endpoint collection.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><Download className="h-4 w-4"/>Download collection</span></a>
      <a download href="/postman/PowerChain-Local.postman_environment.json" className="dashboard-panel block"><ShieldCheck className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">Local Environment</h2><p className="mt-2 text-sm text-[var(--muted)]">Defaults baseUrl to http://localhost:3000/api/v1 and includes an idempotency variable.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><Download className="h-4 w-4"/>Download environment</span></a>
    </section>
  </div></Shell>
}
