"use client"

import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewWarehouse() {
  return (
    <PageShell title="Settings — Add Warehouse" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Warehouse</CardTitle>
          <CardDescription>Create a new storage location</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input placeholder="WH-D" />
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="West DC" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input placeholder="City, State" />
          </div>
          <Button className="w-fit bg-violet-600 hover:bg-violet-600/90">Create Warehouse</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
