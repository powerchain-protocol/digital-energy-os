export const ERP_VERSION="1.0.0" as const;
export type ErpDocumentType="INVOICE"|"PURCHASE_ORDER"|"CREDIT_NOTE"|"CONTRACT"|"SETTLEMENT_STATEMENT";
export interface ErpDocument{id:string;organizationId:string;type:ErpDocumentType;externalReference?:string;counterpartyId?:string;currency:string;amountMinor:bigint;status:"DRAFT"|"OPEN"|"PAID"|"VOID"|"RECONCILED";sourceSystem:string;createdAt:string;updatedAt:string}
export interface ErpAdapter{provider:string;health():Promise<{state:"READY"|"UNCONFIGURED"|"ERROR"}>;sync(organizationId:string,cursor?:string):Promise<{documents:ErpDocument[];nextCursor?:string}>}
