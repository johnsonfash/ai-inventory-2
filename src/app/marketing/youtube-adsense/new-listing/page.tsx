"use client"

import { PageShell } from "@/components/page-shell"
import { ListingForm } from "@/components/marketing/listing-form"

export default function NewListingYouTubeAdsense() {
  return (
    <PageShell title="YouTube & AdSense — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="youtube-adsense" />
    </PageShell>
  )
}
