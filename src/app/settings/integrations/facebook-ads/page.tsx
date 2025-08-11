"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function FacebookAdsConfig() {
  return (
    <PageShell title="Integrations — Facebook Ads" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Facebook Ads</CardTitle>
          <CardDescription>Configure ad account and pixel</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Access Token</Label>
            <Input placeholder="EAAB..." />
          </div>
          <div className="grid gap-2">
            <Label>Ad Account ID</Label>
            <Input placeholder="act_123..." />
          </div>
          <div className="grid gap-2">
            <Label>Pixel ID</Label>
            <Input placeholder="1234567890" />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
