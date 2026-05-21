import { Facebook } from "lucide-react"
import { CampaignShell } from "@/components/marketing/campaign-shell"

export default function NewFacebookCampaign() {
  return <CampaignShell channel="Facebook Ads" Icon={Facebook} tone="sky" backHref="/marketing/facebook-ads" kind="campaign" providerId="facebook-ads" />
}
