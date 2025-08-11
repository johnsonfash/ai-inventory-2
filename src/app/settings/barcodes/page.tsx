"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
export default function BarcodeSettings() {
  return (
    <PageShell title="Settings — Barcode Settings" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Barcode Settings</CardTitle>
          <CardDescription>Label size and format</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Label Width (mm)</Label>
            <Input type="number" defaultValue={50} />
          </div>
          <div className="grid gap-2">
            <Label>Label Height (mm)</Label>
            <Input type="number" defaultValue={30} />
          </div>
          <Button className="w-fit">Save</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
