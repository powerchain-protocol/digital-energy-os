export const EMS_VERSION="1.0.0" as const;
export type EmsOperatorType="company"|"partnership"|"electricity_retailer"|"energy_company"|"utility"|"grid_operator"|"community";
export interface EmsWorkspace{organizationId:string;operatorType:EmsOperatorType;sites:number;meters:number;devices:number;activeAlerts:number;localMarketEnabled:boolean;billingEnabled:boolean;observedAt:string;state:"READY"|"PARTIAL"|"UNCONFIGURED"}
export const EMS_MODULES=["energy-monitoring","smart-metering","connected-devices","local-energy","billing","settlement","forecasting","renewables","rewards","treasury"] as const;
