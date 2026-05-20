import { Instagram } from "lucide-react"
import { CampaignShell } from "@/components/marketing/campaign-shell"

export default function NewInstagramCampaign() {
  return <CampaignShell channel="Instagram Ads" Icon={Instagram} tone="fuchsia" backHref="/marketing/instagram-ads" kind="campaign" />
}
