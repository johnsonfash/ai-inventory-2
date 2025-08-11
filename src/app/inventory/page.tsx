"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { InventoryList } from "@/src/components/inventory-list"

export default function InventoryItems() {
  return (
    <PageShell title="Inventory — Items" withToolbar>
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Image, location and details included</CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryList />
        </CardContent>
      </Card>
    </PageShell>
  )
}
