import { AssetGraphRepository } from "@powerchain/database/asset-graph";
import { withApi,apiJson } from "@/lib/api/with-api";
const repository=new AssetGraphRepository();
export async function GET(request:Request){return withApi(request,{auth:"required"},async context=>apiJson(await repository.snapshot(context.organizationId!),context,{headers:{"cache-control":"no-store"}}))}
