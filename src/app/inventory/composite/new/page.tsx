"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function NewComposite() {
  return (
    <PageShell title="Inventory — New Composite Item" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Composite Item</CardTitle>
          <CardDescription>Combine multiple components into one SKU</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="Remote Work Kit" />
            </div>
            <div className="grid gap-2">
              <Label>SKU</Label>
              <Input placeholder="KIT-001" />
            </div>
            <div className="grid gap-2">
              <Label>Unit</Label>
              <Input placeholder="pcs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Component SKU</Label>
              <Input placeholder="EL-2109" />
            </div>
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input type="number" defaultValue={1} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="bg-transparent">
                Add Component
              </Button>
            </div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Composite</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
