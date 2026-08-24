import Link from "next/link";
import { Shell } from "@/components/shell";
import { DocsHero } from "@/components/docs";
export default function ApiDocs(){
  return <Shell><div className="space-y-6"><DocsHero/><section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm dark:bg-[var(--surface)]">
    <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">API v1 · canonical</p>
    <h2 className="mt-2 text-2xl font-semibold">OpenAPI, Swagger and Postman</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">PowerChain exposes versioned APIs for Digital Energy, Local Energy, Explorer, Marketplace, Checkout, PET-20 tokenization, integrations and operational services. Economic write examples include idempotency and explicit wallet/approval boundaries.</p>
    <div className="mt-5 flex flex-wrap gap-3"><a href="/swagger" className="rounded-2xl bg-emerald-950 px-4 py-2.5 text-sm font-semibold text-white">Swagger reference</a><a href="/openapi.yaml" className="rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold">OpenAPI YAML</a><Link href="/postman" className="rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold">Postman</Link><Link href="/developer" className="rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold">Developer workspace</Link></div>
  </section></div></Shell>
}
