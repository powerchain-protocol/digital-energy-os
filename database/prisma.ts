export type DatabaseHealth={provider:"prisma";configured:boolean};
export function getPrismaHealth():DatabaseHealth{return{provider:"prisma",configured:Boolean(process.env.DATABASE_URL)}};
export const prisma={health:getPrismaHealth};
