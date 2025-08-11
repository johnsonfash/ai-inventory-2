"use client"

import * as React from "react"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { AddSupplierDialog } from "@/src/components/dialogs/add-supplier-dialog"

export default function NewItemPage() {
  const [suppliers, setSuppliers] = React.useState(["Cobalt", "Delta", "Acme"])
  const [supplier, setSupplier] = React.useState<string>("Cobalt")

  return (
    <PageShell title="Inventory — New Item" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
          <CardDescription>All details needed for inventory and purchasing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-3">
              <Label>Item Name</Label>
              <Input placeholder="USB‑C Hub 6‑in‑1" />
              <Label className="mt-3">SKU</Label>
              <Input placeholder="EL-2109" />
              <Label className="mt-3">Category</Label>
              <Select defaultValue="electronics">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <Input placeholder="Cobalt" />
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Input placeholder="pcs" />
                </div>
                <div className="grid gap-2">
                  <Label>Warranty</Label>
                  <Input placeholder="12 months" />
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <Label>Primary Supplier</Label>
              <div className="flex gap-2">
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddSupplierDialog
                  onCreate={(s) => {
                    setSuppliers((prev) => [...prev, s.name])
                    setSupplier(s.name)
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Reorder Point</Label>
                  <Input type="number" defaultValue={20} />
                </div>
                <div className="grid gap-2">
                  <Label>Opening Stock</Label>
                  <Input type="number" defaultValue={0} />
                </div>
              </div>

              <Label className="mt-3">Image</Label>
              <Input type="file" accept="image/*" />

              <Label className="mt-3">Description</Label>
              <Textarea placeholder="Details for internal and storefront" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-violet-600 hover:bg-violet-600/90">Save Item</Button>
            <Button variant="outline" className="bg-transparent">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
