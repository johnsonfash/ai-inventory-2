"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function WooCommerceConfig() {
  return (
    <PageShell title="Integrations — WooCommerce" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>WooCommerce</CardTitle>
          <CardDescription>Connect your WordPress store</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Store URL</Label>
            <Input placeholder="https://store.example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Consumer Key</Label>
            <Input placeholder="ck_..." />
          </div>
          <div className="grid gap-2">
            <Label>Consumer Secret</Label>
            <Input placeholder="cs_..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
