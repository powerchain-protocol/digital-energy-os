export type SqlRow = Record<string, unknown>;

export function getNeonSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return async function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<SqlRow[]> {
    throw new Error(`Neon HTTP adapter is not installed. Query was not executed: ${String.raw({ raw: strings }, ...values)}`);
  };
}
