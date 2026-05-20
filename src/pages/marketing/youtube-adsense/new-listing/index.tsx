import { Youtube } from "lucide-react"
import { CampaignShell } from "@/components/marketing/campaign-shell"

export default function NewYoutubeListing() {
  return <CampaignShell channel="YouTube & AdSense" Icon={Youtube} tone="rose" backHref="/marketing/youtube-adsense" kind="listing" />
}
