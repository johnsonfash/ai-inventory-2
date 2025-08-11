"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"

export default function NewPriceList() {
  return (
    <PageShell title="Inventory — New Price List" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create Price List</CardTitle>
          <CardDescription>Tiered pricing per customer segment</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-xl">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input placeholder="Retail" />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-600/90 w-fit">Create Price List</Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
