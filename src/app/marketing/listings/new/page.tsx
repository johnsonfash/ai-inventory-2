"use client"

import { PageShell } from "@/src/components/page-shell"
import { ListingForm } from "@/src/components/marketing/listing-form"

export default function NewListing() {
  return (
    <PageShell title="Marketing — New Listing" withToolbar={false}>
      <ListingForm />
    </PageShell>
  )
}
