import { Music2 } from "lucide-react"
import { ChannelShell, type Campaign } from "@/components/marketing/channel-shell"

// No campaigns yet — TikTok is "available" until connected. The new-ad
// actions route to the unified builder (which has TikTok as a publish
// target + vertical-video guidance).
const campaigns: Campaign[] = []

export default function TikTokAds() {
  return (
    <ChannelShell
      title="TikTok Ads"
      description="In-feed video + Spark Ads to a younger, mobile-first audience."
      titleTooltip={
        <>
          Short-form vertical video ads on TikTok. Best paired with the
          AI video generator (Marketing → generate) so you can ship
          native 9:16 creative without a studio. Watch
          <strong> ROAS</strong> the same way you do on Meta.
        </>
      }
      Icon={Music2}
      tone="violet"
      campaigns={campaigns}
      newCampaignHref="/marketing/listings/new"
      newListingHref="/marketing/listings/new"
    />
  )
}
