import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const regions = [
  ["North America", "92.4 GW", "+4.6%"], ["Europe", "78.1 GW", "+2.1%"], ["Asia Pacific", "112.7 GW", "+3.9%"], ["South America", "34.6 GW", "+1.9%"]
];

export function DashboardMap() {
  return (
    <article className="dashboard-map-card">
      <div className="dashboard-card-head"><div><span className="eyebrow">Global operations</span><h2>Renewable grid overview</h2></div><Link href="/map">Open smart grid map <ArrowUpRight/></Link></div>
      <div className="world-map-visual" aria-label="Stylized worldwide PowerChain network map">
        <div className="map-grid"/><div className="map-orbit orbit-one"/><div className="map-orbit orbit-two"/>
        {regions.map(([name,value,change],index)=><div key={name} className={`region-node region-${index+1}`}><i/><span>{name}</span><strong>{value}</strong><small>{change}</small></div>)}
        <div className="map-legend"><span><i className="normal"/>Normal</span><span><i className="risk"/>High risk</span><span><i className="offline"/>Offline</span></div>
      </div>
    </article>
  );
}
