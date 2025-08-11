"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function FacebookMarketplaceConfig() {
  return (
    <PageShell title="Integrations — Facebook Marketplace" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Facebook Marketplace</CardTitle>
          <CardDescription>Connect catalog and listing permissions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Page ID</Label>
            <Input placeholder="123456789" />
          </div>
          <div className="grid gap-2">
            <Label>Catalog ID</Label>
            <Input placeholder="987654321" />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
