"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function CalendarConfig() {
  return (
    <PageShell title="Integrations — Calendar" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Calendar Sync</CardTitle>
          <CardDescription>Connect external calendars</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Input placeholder="Google / Outlook" />
          </div>
          <div className="grid gap-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
