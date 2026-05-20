import { Instagram } from "lucide-react"
import { CampaignShell } from "@/components/marketing/campaign-shell"

export default function NewInstagramListing() {
  return <CampaignShell channel="Instagram Ads" Icon={Instagram} tone="fuchsia" backHref="/marketing/instagram-ads" kind="listing" />
}
