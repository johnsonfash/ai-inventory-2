"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewBrand() {
  return (
    <PageShell title="Inventory — Add Brand" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>New Brand</CardTitle>
          <CardDescription>Register a manufacturer or brand</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Cobalt" />
          </div>
          <div className="grid gap-2">
            <Label>Website</Label>
            <Input placeholder="https://example.com" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Brand</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
