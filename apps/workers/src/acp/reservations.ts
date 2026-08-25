import { acpRepositories } from "@powerchain/database/acp";
import { realtimeEvents } from "@powerchain/database/realtime";
export async function runAcpReservationCycle(){const released=await acpRepositories.reservations.releaseExpired(100);for(const item of released)await realtimeEvents.append({organizationId:item.organizationId,channel:"acp.operations",event:"powerchain.acp.budget_reservation.expired.v1",data:item});return{released:released.length}}
