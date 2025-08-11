"use client"

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

export function CreatePOSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>Create Purchase Order</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label>Supplier</Label>
            <Select defaultValue="cobalt">
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cobalt">Cobalt</SelectItem>
                <SelectItem value="delta">Delta</SelectItem>
                <SelectItem value="acme">Acme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="EL-2109" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qty">Qty</Label>
              <Input id="qty" type="number" defaultValue={50} />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Create PO</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
