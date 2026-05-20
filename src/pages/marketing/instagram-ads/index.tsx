import { Instagram } from "lucide-react"
import { ChannelShell, type Campaign } from "@/components/marketing/channel-shell"

const campaigns: Campaign[] = [
  { id: "IG-3001", name: "Reels · Hydrating Serum", status: "active", spend: 320, impressions: 24100, clicks: 980, conversions: 64, roas: 4.8 },
  { id: "IG-3002", name: "Stories · Ceramic Mug", status: "active", spend: 240, impressions: 18900, clicks: 740, conversions: 41, roas: 3.4 },
  { id: "IG-3003", name: "Shopping · Top Sellers", status: "active", spend: 420, impressions: 32400, clicks: 1240, conversions: 96, roas: 5.6 },
  { id: "IG-3004", name: "Influencer · Q1 brief", status: "ended", spend: 1800, impressions: 124200, clicks: 4120, conversions: 312, roas: 6.1 },
]

export default function InstagramAds() {
  return (
    <ChannelShell
      title="Instagram Ads"
      description="Reels, Stories, and Shopping ads from your Pallio catalog."
      Icon={Instagram}
      tone="fuchsia"
      campaigns={campaigns}
      newCampaignHref="/marketing/instagram-ads/new-campaign"
      newListingHref="/marketing/instagram-ads/new-listing"
    />
  )
}
