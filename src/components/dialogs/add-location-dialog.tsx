import * as React from "react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QuickLocation = {
  name: string
  type: "storefront" | "warehouse" | "office" | "popup"
  address: string
  phone: string
  manager: string
}

// Quick-add location overlay — the "Add location" create flow for the
// settings list. Same page-vs-overlay pattern as the other quick-adds.
export function AddLocationDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (l: QuickLocation) => void
}) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<QuickLocation["type"]>("storefront")
  const [address, setAddress] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [manager, setManager] = React.useState("")

  const valid = name.trim().length > 0

  React.useEffect(() => {
    if (!open) return
    setName("")
    setType("storefront")
    setAddress("")
    setPhone("")
    setManager("")
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({
      name: name.trim(),
      type,
      address: address.trim() || "—",
      phone: phone.trim() || "—",
      manager: manager.trim() || "—",
    })
    toast.success("Location added", { description: name.trim() })
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add location"
      description="A storefront, warehouse, office, or pop-up. You can fill in the rest later."
      maxHeightVh={84}
      footer={
        <div className="flex items-center justify-end gap-2 pb-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!valid}>Add location</Button>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex flex-col gap-3 pb-1">
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Name</span>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Downtown store" required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Type</span>
            <Select value={type} onValueChange={(v) => setType(v as QuickLocation["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="storefront">Storefront</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="popup">Pop-up</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Manager</span>
            <Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Who runs it" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Address</span>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Phone</span>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 …" />
        </label>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
