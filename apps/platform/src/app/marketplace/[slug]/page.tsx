import { Shell } from "@/components/shell";
import { MarketplaceDetail } from "@/components/marketplace/marketplace-detail";
export default async function MarketplaceListingPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <Shell><MarketplaceDetail slug={slug}/></Shell>}
