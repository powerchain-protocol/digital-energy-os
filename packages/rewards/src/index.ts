export const REWARDS_VERSION="1.0.0" as const;
export type RewardReason="VERIFIED_ENERGY"|"FLEXIBILITY"|"DEPIN_AVAILABILITY"|"COMMUNITY_CONTRIBUTION"|"DEVICE_RELIABILITY";
export interface RewardAllocation{id:string;organizationId:string;participantId:string;epoch:string;reason:RewardReason;pwrcRaw:bigint;evidenceIds:string[];state:"PENDING"|"APPROVED"|"CLAIMABLE"|"CLAIMED";createdAt:string}
export function allocateReward(input:Omit<RewardAllocation,"id"|"state"|"createdAt">):RewardAllocation{if(input.pwrcRaw<=0n)throw new Error("REWARD_AMOUNT_INVALID");if(!input.evidenceIds.length)throw new Error("REWARD_EVIDENCE_REQUIRED");return{id:`rwd_${crypto.randomUUID()}`,...input,state:"PENDING",createdAt:new Date().toISOString()}}
