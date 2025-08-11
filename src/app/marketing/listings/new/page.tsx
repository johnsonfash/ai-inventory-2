"use client"

import { PageShell } from "@/components/page-shell"
import { ListingForm } from "@/components/marketing/listing-form"

export default function NewListing() {
  return (
    <PageShell title="Marketing — New Listing" withToolbar={false}>
      <ListingForm />
    </PageShell>
  )
}
