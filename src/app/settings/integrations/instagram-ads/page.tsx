"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
