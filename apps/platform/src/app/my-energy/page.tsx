import { CopilotContextProvider } from "@/context/copilot-context";
import { Shell } from "@/components/shell";
import { MyEnergyDashboard } from "@/components/energy/my-energy-dashboard";
export default function MyEnergyPage(){return <CopilotContextProvider value={{page:"my-energy",label:"My Energy"}}><Shell><div className="content-container"><MyEnergyDashboard/></div></Shell></CopilotContextProvider>}
