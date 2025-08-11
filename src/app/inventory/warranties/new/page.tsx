"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"

export default function NewWarranty() {
  return (
    <PageShell title="Inventory — Add Warranty" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Warranty</CardTitle>
          <CardDescription>Define warranty duration and terms</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="12 months" />
          </div>
          <div className="grid gap-2">
            <Label>Terms</Label>
            <Textarea placeholder="Coverage details…" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Warranty</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
