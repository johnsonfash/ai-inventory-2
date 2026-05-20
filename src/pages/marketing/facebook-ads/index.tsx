import { Facebook } from "lucide-react"
import { ChannelShell, type Campaign } from "@/components/marketing/channel-shell"

const campaigns: Campaign[] = [
  { id: "FB-2001", name: "Summer Promo · Tee restock", status: "active", spend: 480, impressions: 18200, clicks: 422, conversions: 38, roas: 4.2 },
  { id: "FB-2002", name: "Back to School", status: "paused", spend: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 },
  { id: "FB-2003", name: "USB-C Hub · Holiday", status: "active", spend: 760, impressions: 32600, clicks: 1140, conversions: 84, roas: 5.1 },
  { id: "FB-2004", name: "Local — Austin", status: "draft", spend: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 },
]

export default function FacebookAds() {
  return (
    <ChannelShell
      title="Facebook Ads"
      description="Catalog-driven product ads across Facebook placements."
      Icon={Facebook}
      tone="sky"
      campaigns={campaigns}
      newCampaignHref="/marketing/facebook-ads/new-campaign"
      newListingHref="/marketing/facebook-ads/new-listing"
    />
  )
}
