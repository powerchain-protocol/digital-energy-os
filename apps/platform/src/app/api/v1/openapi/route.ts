import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET(){
  const path=join(process.cwd(),"public","openapi.yaml");
  const body=await readFile(path,"utf8");
  return new Response(body,{headers:{"content-type":"application/yaml; charset=utf-8","cache-control":"public, max-age=300"}});
}
