import { CopilotContextProvider } from "@/context/copilot-context";
import { Shell } from "@/components/shell";
import { EnergyMonitoringPanel } from "@/components/energy/energy-monitoring-panel";
export default function MonitoringPage(){return <CopilotContextProvider value={{page:"my-energy-monitoring",label:"Energy Monitoring"}}><Shell><div className="content-container"><EnergyMonitoringPanel/></div></Shell></CopilotContextProvider>}
