import { readFile } from "node:fs/promises";
import path from "node:path";
export const dynamic="force-static";
export async function GET(){const file=path.join(process.cwd(),"public","postman","PowerChain-v1.0.0.postman_collection.json");const body=await readFile(file,"utf8");return new Response(body,{headers:{"content-type":"application/json; charset=utf-8","content-disposition":"attachment; filename=PowerChain-v1.0.0.postman_collection.json","cache-control":"public, max-age=300"}})}
