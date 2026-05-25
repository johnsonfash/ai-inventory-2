import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QuickCustomer = {
  name: string
  email: string
  phone?: string
  type: "retail" | "wholesale" | "online"
}

// Quick-add customer overlay. The 90% case (name + email + maybe phone)
// shouldn't cost a full-page navigation — so this rides on `BottomSheet`
// (drawer on mobile where the keyboard lives, centred modal on desktop)
// and keeps the rich /sales/customers/new page reachable via "More
// details" for addresses + trading terms. This is the page-vs-overlay
// pattern: layer a quick-create on top, don't delete the page.
export function AddCustomerDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (c: QuickCustomer) => void
}) {
  const navigate = useNavigate()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [type, setType] = React.useState<QuickCustomer["type"]>("retail")

  const valid = name.trim().length > 0 && email.trim().length > 0

  // Reset whenever it re-opens so a cancelled draft never bleeds into
  // the next add.
  React.useEffect(() => {
    if (!open) return
    setName("")
    setEmail("")
    setPhone("")
    setType("retail")
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, type })
    toast.success("Customer added", { description: name.trim() })
    onClose()
  }

  const openFull = () => {
    onClose()
    navigate("/sales/customers/new")
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add customer"
      description="Quick add — a name and email is enough. You can fill in the rest later."
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
            <Button type="button" onClick={submit} disabled={!valid}>Add customer</Button>
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
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Name</span>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NovaApps or full name"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ops@novaapps.io"
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Phone</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 555 0123"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Type</span>
            <Select value={type} onValueChange={(v) => setType(v as QuickCustomer["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        {/* Submit lives in the sheet footer; this hidden button lets Enter
            submit from any field. */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
