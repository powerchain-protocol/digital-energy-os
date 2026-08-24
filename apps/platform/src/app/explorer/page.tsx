import { Suspense } from "react";
import { Shell } from "@/components/shell";
import { ExplorerWorkspace } from "@/components/explorer/explorer-workspace";
export default function ExplorerPage(){return <Shell><Suspense fallback={<div className="content-container">Loading explorer…</div>}><ExplorerWorkspace/></Suspense></Shell>}
