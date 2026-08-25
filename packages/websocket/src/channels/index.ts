export type PowerChainChannel=
  |"platform.status"
  |"energy.telemetry"
  |"market.quotes"
  |"settlement.status"
  |"notifications"
  |"acp.jobs"
  |"acp.approvals"
  |"acp.evidence"
  |"acp.reconciliation"
  |"acp.operations"
  |"treasury.allocations"
  |"treasury.reconciliation"
  |"treasury.close";
export interface ChannelDefinition{channel:PowerChainChannel;visibility:"public"|"organization";scope?:string;retentionSeconds:number;fallbacks:readonly("sse"|"polling")[]}
export const channelDefinitions:readonly ChannelDefinition[]=[
  {channel:"platform.status",visibility:"public",retentionSeconds:900,fallbacks:["sse","polling"]},
  {channel:"energy.telemetry",visibility:"organization",scope:"energy:read",retentionSeconds:3600,fallbacks:["sse","polling"]},
  {channel:"market.quotes",visibility:"organization",scope:"market:read",retentionSeconds:900,fallbacks:["sse","polling"]},
  {channel:"settlement.status",visibility:"organization",scope:"settlement:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"notifications",visibility:"organization",scope:"notifications:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"acp.jobs",visibility:"organization",scope:"acp:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"acp.approvals",visibility:"organization",scope:"acp:approve",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"acp.evidence",visibility:"organization",scope:"acp:evidence",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"acp.reconciliation",visibility:"organization",scope:"acp:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"acp.operations",visibility:"organization",scope:"acp:operations",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"treasury.allocations",visibility:"organization",scope:"treasury:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"treasury.reconciliation",visibility:"organization",scope:"treasury:read",retentionSeconds:86400,fallbacks:["sse","polling"]},
  {channel:"treasury.close",visibility:"organization",scope:"treasury:close",retentionSeconds:604800,fallbacks:["sse","polling"]},
] as const;
export const channelNames=channelDefinitions.map(item=>item.channel);
export function channelDefinition(channel:string){return channelDefinitions.find(item=>item.channel===channel)}
