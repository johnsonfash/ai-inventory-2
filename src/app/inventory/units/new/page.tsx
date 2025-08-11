"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewUnit() {
  return (
    <PageShell title="Inventory — Add Unit" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Unit</CardTitle>
          <CardDescription>Define a unit of measure</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Code</Label>
            <Input placeholder="pcs" />
          </div>
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Pieces" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Unit</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
