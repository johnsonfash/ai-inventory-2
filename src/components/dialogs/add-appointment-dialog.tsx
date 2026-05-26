import * as React from "react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QuickAppt = {
  title: string
  customer: string
  date: string // YYYY-MM-DD
  start: string
  end: string
  staff: string
  location: string
  type: "consult" | "service" | "installation" | "follow-up"
}

// Quick-add booking overlay — the appointments calendar's "New
// appointment" create flow. A title + when + who is enough; status
// defaults to scheduled. Same page-vs-overlay pattern as the other
// quick-adds (customer, vendor, printer).
export function AddAppointmentDialog({
  open,
  onClose,
  onCreate,
  staffOptions,
  defaultDate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (a: QuickAppt) => void
  staffOptions: string[]
  defaultDate: string
}) {
  const [title, setTitle] = React.useState("")
  const [customer, setCustomer] = React.useState("")
  const [date, setDate] = React.useState(defaultDate)
  const [start, setStart] = React.useState("09:00")
  const [end, setEnd] = React.useState("09:30")
  const [staff, setStaff] = React.useState(staffOptions[0] ?? "")
  const [location, setLocation] = React.useState("")
  const [type, setType] = React.useState<QuickAppt["type"]>("service")

  React.useEffect(() => {
    if (!open) return
    setTitle("")
    setCustomer("")
    setDate(defaultDate)
    setStart("09:00")
    setEnd("09:30")
    setStaff(staffOptions[0] ?? "")
    setLocation("")
    setType("service")
  }, [open, defaultDate, staffOptions])

  const valid = title.trim().length > 0 && date.length > 0 && end >= start

  const submit = () => {
    if (!valid) return
    onCreate({
      title: title.trim(),
      customer: customer.trim() || "Walk-in",
      date,
      start,
      end,
      staff,
      location: location.trim() || "—",
      type,
    })
    toast.success("Appointment booked", { description: `${title.trim()} · ${date} ${start}` })
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="New appointment"
      description="Book a consult, service, install, or follow-up. You can edit the details later."
      maxHeightVh={88}
      footer={
        <div className="flex items-center justify-end gap-2 pb-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={!valid}>Book it</Button>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="flex flex-col gap-3 pb-1">
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Title</span>
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fitting, consult, pickup…" required />
        </label>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Customer</span>
          <Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer or company" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">From</span>
            <Input type="time" value={start} onChange={(e) => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value) }} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">To</span>
            <Input type="time" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Staff</span>
            <Select value={staff} onValueChange={setStaff}>
              <SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger>
              <SelectContent>
                {staffOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Type</span>
            <Select value={type} onValueChange={(v) => setType(v as QuickAppt["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="consult">Consult</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Location</span>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Storefront, on-site, virtual…" />
        </label>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
