"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useAccess } from "@/context/access-context";
import { roleDashboards } from "@/data/role-dashboards";
import { DashboardHero } from "./dashboard-hero";
import { DashboardStats } from "./dashboard-stats";
import { DashboardMap } from "./dashboard-map";
import { HealthPanel } from "./health-panel";
import { AssetStrip } from "./asset-strip";
import { GenerationChart } from "./generation-chart";
import { GenerationMix } from "./generation-mix";

export function DashboardPage(){
 const {role,can}=useAccess();
 const dashboard=roleDashboards[role]??roleDashboards.consumer;
 const quickActions=dashboard.quickActions??[dashboard.primaryAction].filter((value): value is string=>Boolean(value));
 return <Shell><div className="dashboard-page">
  <DashboardHero roleLabel={role.replace("-"," ")} title={dashboard.title} subtitle={dashboard.subtitle} quickActions={quickActions} canTrade={can("marketplace:trade")}/>
  <DashboardStats/>
  <section className="dashboard-main-grid"><DashboardMap/><aside className="dashboard-side-stack"><HealthPanel/><article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">AI operations</span><h2>Priority insight</h2></div></div><p className="ai-priority">Wind output is forecast to rise 12.4% in Northern Europe. Shift storage charging to the 14:00–17:00 window.</p><Link className="text-link" href="/chat">Ask PowerChain AI <ArrowUpRight/></Link></article></aside></section>
  <AssetStrip/>
  <section className="dashboard-bottom-grid"><GenerationChart/><GenerationMix/></section>
 </div></Shell>
}
