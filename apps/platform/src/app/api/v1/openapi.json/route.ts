import { readFile } from "node:fs/promises";
import path from "node:path";
export const dynamic="force-static";
export async function GET(){const file=path.join(process.cwd(),"public","openapi.json");const body=await readFile(file,"utf8");return new Response(body,{headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=300, stale-while-revalidate=3600"}})}
