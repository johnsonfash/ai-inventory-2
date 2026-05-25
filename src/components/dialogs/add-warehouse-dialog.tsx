import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type QuickWarehouse = {
  code: string
  name: string
  location: string
  manager: string
}

// Quick-add a warehouse / location. Name + code + city is enough to start
// stocking it; capacity, zones and contact details live on the full
// /settings/warehouses/new page behind "More details".
export function AddWarehouseDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (w: QuickWarehouse) => void
}) {
  const navigate = useNavigate()
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [manager, setManager] = React.useState("")

  const valid = name.trim().length > 0 && code.trim().length > 0

  React.useEffect(() => {
    if (!open) return
    setName("")
    setCode("")
    setLocation("")
    setManager("")
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      location: location.trim() || "—",
      manager: manager.trim() || "—",
    })
    toast.success("Location added", { description: `${name.trim()} (${code.trim().toUpperCase()})` })
    onClose()
  }

  const openFull = () => {
    onClose()
    navigate("/settings/warehouses/new")
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add location"
      description="A warehouse, store, or stockroom you hold inventory in."
      maxHeightVh={80}
      footer={
        <div className="flex items-center justify-between gap-2 pb-3">
          <button
            type="button"
            onClick={openFull}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline dark:text-primary"
          >
            More details <ArrowRight className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={submit} disabled={!valid}>Add location</Button>
          </div>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex flex-col gap-3 pb-1"
      >
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Name</span>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Warehouse"
              required
            />
          </label>
          <label className="flex w-28 flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Code</span>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="WH-A"
              className="font-mono uppercase"
              required
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Location <span className="font-normal text-muted-foreground">(city)</span></span>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lekki, Lagos" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Manager <span className="font-normal text-muted-foreground">(optional)</span></span>
          <Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Who runs this location?" />
        </label>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
