import { CopilotContextProvider } from "@/context/copilot-context";
import { Shell } from "@/components/shell";
import { ConnectedDevices } from "@/components/energy/connected-devices";
export default function DevicesPage(){return <CopilotContextProvider value={{page:"my-energy-devices",label:"Connected Devices"}}><Shell><div className="content-container"><ConnectedDevices/></div></Shell></CopilotContextProvider>}
