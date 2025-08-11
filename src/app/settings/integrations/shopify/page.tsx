"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ShopifyConfig() {
  return (
    <PageShell title="Integrations — Shopify" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Shopify</CardTitle>
          <CardDescription>Sync products, orders and inventory</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Store Domain</Label>
            <Input placeholder="your-store.myshopify.com" />
          </div>
          <div className="grid gap-2">
            <Label>Access Token</Label>
            <Input placeholder="shpat_..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
