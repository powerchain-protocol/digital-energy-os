export const EVENT_BUS_VERSION="1.0.0" as const;
export type PowerChainEventType=
 |"energy.production.recorded"|"energy.period.verified"|"device.offline"|"device.online"|"device.anomaly.detected"
 |"carbon.credit.issued"|"carbon.credit.retired"|"treasury.settlement.completed"|"agent.job.created"|"agent.job.completed"
 |"transaction.approval.requested"|"transaction.signed"|"marketplace.trade.prepared";
export interface PowerChainEvent<T=unknown>{
 id:string;type:PowerChainEventType|string;source:string;organizationId:string;assetId?:string;deviceId?:string;
 requestId:string;traceId:string;correlationId:string;causationId?:string;occurredAt:string;payload:T;schemaVersion:"1.0.0";
}
export interface EventBusPublisher{publish<T>(event:PowerChainEvent<T>):Promise<void>;publishMany(events:PowerChainEvent[]):Promise<void>}
export interface EventSubscription{organizationId:string;types?:string[];cursor?:string}
export function createEvent<T>(input:Omit<PowerChainEvent<T>,"id"|"occurredAt"|"schemaVersion">&{occurredAt?:string}):PowerChainEvent<T>{return{id:`evt_${crypto.randomUUID()}`,schemaVersion:"1.0.0",occurredAt:input.occurredAt??new Date().toISOString(),...input}}
