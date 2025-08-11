"use client"

import { useParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditWarehouse() {
  const params = useParams<{ code: string }>()
  const code = params.code?.toUpperCase?.() ?? "WH-?"
  return (
    <PageShell title={`Settings — Edit Warehouse (${code})`} withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Warehouse</CardTitle>
          <CardDescription>Update warehouse details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input defaultValue={code} />
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input defaultValue={code === "WH-A" ? "Main Warehouse" : "Warehouse"} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Address</Label>
            <Input defaultValue={code === "WH-A" ? "Austin, TX" : ""} />
          </div>
          <Button className="w-fit">Save Changes</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
