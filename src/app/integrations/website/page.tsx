"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function WebsiteIntegration() {
  return (
    <PageShell title="Integrations — Website Widget" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Website Integration</CardTitle>
          <CardDescription>Embed script and domain settings</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-2xl">
          <div className="grid gap-2">
            <Label>Allowed Domains</Label>
            <Input placeholder="example.com, app.example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Embed Script</Label>
            <textarea
              className="min-h-[120px] w-full rounded-md border bg-background p-2 text-xs font-mono"
              defaultValue={`<script src="https://cdn.example.com/widget.js" data-org="acme" async></script>`}
            />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
