"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function EasyPostConfig() {
  return (
    <PageShell title="Integrations — EasyPost" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>EasyPost</CardTitle>
          <CardDescription>Shipping API integration</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>API Key</Label>
            <Input placeholder="EASYPOST_..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
