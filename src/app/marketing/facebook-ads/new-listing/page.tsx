"use client"

import { PageShell } from "@/src/components/page-shell"
import { ListingForm } from "@/src/components/marketing/listing-form"

export default function NewListingFacebookAds() {
  return (
    <PageShell title="Facebook Ads — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="facebook-ads" />
    </PageShell>
  )
}
