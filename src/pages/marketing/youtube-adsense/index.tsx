import { Youtube } from "lucide-react"
import { ChannelShell, type Campaign } from "@/components/marketing/channel-shell"

const campaigns: Campaign[] = [
  { id: "YT-4001", name: "Demo videos · Hub", status: "active", spend: 320, impressions: 12600, clicks: 412, conversions: 24, roas: 2.1 },
  { id: "YT-4002", name: "How-to · Serum routine", status: "draft", spend: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 },
]

export default function YoutubeAdsense() {
  return (
    <ChannelShell
      title="YouTube & AdSense"
      description="Affiliate placements + video ad inventory."
      Icon={Youtube}
      tone="rose"
      campaigns={campaigns}
      newCampaignHref="/marketing/youtube-adsense/new-campaign"
      newListingHref="/marketing/youtube-adsense/new-listing"
    />
  )
}
