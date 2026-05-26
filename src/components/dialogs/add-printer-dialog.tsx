import * as React from "react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QuickPrinter = {
  name: string
  model: string
  type: "receipt" | "label" | "kitchen"
  location: string
  connection: "wifi" | "usb" | "bluetooth"
}

// Quick-add printer overlay. A printer is a small, flat record (name +
// model + how it connects), so the whole create flow fits the overlay —
// there's no richer full page to defer to, so no "More details" link.
export function AddPrinterDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (p: QuickPrinter) => void
}) {
  const [name, setName] = React.useState("")
  const [model, setModel] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [type, setType] = React.useState<QuickPrinter["type"]>("receipt")
  const [connection, setConnection] = React.useState<QuickPrinter["connection"]>("wifi")

  const valid = name.trim().length > 0

  React.useEffect(() => {
    if (!open) return
    setName("")
    setModel("")
    setLocation("")
    setType("receipt")
    setConnection("wifi")
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({
      name: name.trim(),
      model: model.trim() || "Generic",
      type,
      location: location.trim() || "—",
      connection,
    })
    toast.success("Printer added", { description: name.trim() })
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add printer"
      description="Name it and tell Pallio how it connects. Print jobs route to the right device per location."
      maxHeightVh={82}
      footer={
        <div className="flex items-center justify-end gap-2 pb-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!valid}>Add printer</Button>
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
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Name</span>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Downtown POS-1" required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Model</span>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Epson TM-m30" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Location</span>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Downtown" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Type</span>
            <Select value={type} onValueChange={(v) => setType(v as QuickPrinter["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Connection</span>
            <Select value={connection} onValueChange={(v) => setConnection(v as QuickPrinter["connection"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wifi">Wi-Fi</SelectItem>
                <SelectItem value="usb">USB</SelectItem>
                <SelectItem value="bluetooth">Bluetooth</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
