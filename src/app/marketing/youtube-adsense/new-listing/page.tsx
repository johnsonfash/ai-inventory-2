"use client"

import { PageShell } from "@/src/components/page-shell"
import { ListingForm } from "@/src/components/marketing/listing-form"

export default function NewListingYouTubeAdsense() {
  return (
    <PageShell title="YouTube & AdSense — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="youtube-adsense" />
    </PageShell>
  )
}
