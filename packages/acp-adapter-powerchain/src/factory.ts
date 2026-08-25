import { PowerChainAcpAdapter } from "./adapter";
import { PowerChainProviderClient } from "./client";
import type { PowerChainProviderDirectory,ProviderCredentialResolver } from "./types";
export function createPowerChainAcpAdapter(directory:PowerChainProviderDirectory,credentials:ProviderCredentialResolver){return new PowerChainAcpAdapter(directory,new PowerChainProviderClient(credentials))}
