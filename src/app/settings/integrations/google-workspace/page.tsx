"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function GoogleWorkspaceConfig() {
  return (
    <PageShell title="Integrations — Google Workspace" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Google Workspace</CardTitle>
          <CardDescription>Connect Calendar, Sheets, and Drive</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>OAuth Client ID</Label>
            <Input placeholder="..." />
          </div>
          <div className="grid gap-2">
            <Label>OAuth Client Secret</Label>
            <Input placeholder="..." />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
