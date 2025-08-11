"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function InvoiceSettings() {
  return (
    <PageShell title="Settings — Invoice Settings" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Numbering, branding and defaults</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Prefix</Label>
            <Input defaultValue="INV-" />
          </div>
          <div className="grid gap-2">
            <Label>Next Number</Label>
            <Input defaultValue="3310" />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
