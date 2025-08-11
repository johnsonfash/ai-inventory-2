"use client"

import { PageShell } from "@/components/page-shell"
import { ListingForm } from "@/components/marketing/listing-form"

export default function NewListingInstagramAds() {
  return (
    <PageShell title="Instagram Ads — New Listing" withToolbar={false}>
      <ListingForm defaultChannel="instagram-ads" />
    </PageShell>
  )
}
