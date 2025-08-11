"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function YouTubeAdSenseConfig() {
  return (
    <PageShell title="Integrations — YouTube & AdSense" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>YouTube & AdSense</CardTitle>
          <CardDescription>Channel and ads settings</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>API Key</Label>
            <Input placeholder="AIza..." />
          </div>
          <div className="grid gap-2">
            <Label>Channel ID</Label>
            <Input placeholder="UC..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
