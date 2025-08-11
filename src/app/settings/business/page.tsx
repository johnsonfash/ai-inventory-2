"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function BusinessSettings() {
  return (
    <PageShell title="Settings — Business Settings" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
          <CardDescription>Company details and defaults</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input defaultValue="Acme Inc" />
          </div>
          <div className="grid gap-2">
            <Label>Default Currency</Label>
            <Input defaultValue="USD" />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
