"use client"

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select"

export function NewItemSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>New Item</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="e.g., EL-1001" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder">Reorder Point</Label>
              <Input id="reorder" type="number" defaultValue={20} />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Create Item</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
