"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

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
