"use client"

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

export function ReceiveStockSheet({
  open,
  onOpenChange,
  initialSku,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialSku?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>Receive Stock</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" defaultValue={initialSku ?? ""} placeholder="EL-2109" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" defaultValue={20} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ref">Reference</Label>
              <Input id="ref" placeholder="PO-1043" />
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button onClick={() => onOpenChange(false)}>Receive</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
