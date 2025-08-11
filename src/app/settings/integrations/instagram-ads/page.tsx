"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function InstagramAdsConfig() {
  return (
    <PageShell title="Integrations — Instagram Ads" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Instagram Ads</CardTitle>
          <CardDescription>Configure account and permissions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Access Token</Label>
            <Input placeholder="IGQVJ..." />
          </div>
          <div className="grid gap-2">
            <Label>Business Account ID</Label>
            <Input placeholder="1784..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
