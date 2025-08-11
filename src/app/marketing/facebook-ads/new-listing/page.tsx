"use client"

import { PageShell } from "@/components/page-shell"
import { ListingForm } from "@/components/marketing/listing-form"

export default function NewListingFacebookAds() {
  return (
    <PageShell title="Facebook Ads — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="facebook-ads" />
    </PageShell>
  )
}
