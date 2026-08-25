export const CMR_VERSION="1.0.0" as const;
export type CmrRelationshipType="CUSTOMER"|"PROSUMER"|"RETAILER"|"PARTNER"|"UTILITY"|"COMMUNITY"|"GRID_OPERATOR"|"SERVICE_PROVIDER";
export interface CmrRelationship{id:string;organizationId:string;participantId:string;type:CmrRelationshipType;status:"ACTIVE"|"PROSPECT"|"ON_HOLD"|"CLOSED";ownerId?:string;tags:string[];consents:string[];createdAt:string;updatedAt:string}
export interface CmrInteraction{id:string;organizationId:string;relationshipId:string;channel:"EMAIL"|"PHONE"|"CHAT"|"PORTAL"|"API";summary:string;occurredAt:string;actorId:string}
