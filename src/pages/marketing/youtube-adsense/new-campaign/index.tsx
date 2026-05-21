import { Youtube } from "lucide-react"
import { CampaignShell } from "@/components/marketing/campaign-shell"

export default function NewYoutubeCampaign() {
  return <CampaignShell channel="YouTube & AdSense" Icon={Youtube} tone="rose" backHref="/marketing/youtube-adsense" kind="campaign" providerId="youtube-adsense" />
}
