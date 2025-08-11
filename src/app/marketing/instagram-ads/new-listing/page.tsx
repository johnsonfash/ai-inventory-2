"use client"

import { PageShell } from "@/src/components/page-shell"
import { ListingForm } from "@/src/components/marketing/listing-form"

export default function NewListingInstagramAds() {
  return (
    <PageShell title="Instagram Ads — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="instagram-ads" />
    </PageShell>
  )
}
