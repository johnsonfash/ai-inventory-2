import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type QuickVendor = {
  name: string
  email: string
  phone?: string
  category: string
  paymentTerms: string
}

// Quick-add vendor overlay — same page-vs-overlay pattern as the
// customer quick-add. A name + email is enough to start writing POs;
// lead time, on-time history and the rest fill in on the full
// /purchasing/vendors/new page (reachable via "More details").
export function AddVendorDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (v: QuickVendor) => void
}) {
  const navigate = useNavigate()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [paymentTerms, setPaymentTerms] = React.useState("Net 30")

  const valid = name.trim().length > 0 && email.trim().length > 0

  React.useEffect(() => {
    if (!open) return
    setName("")
    setEmail("")
    setPhone("")
    setCategory("")
    setPaymentTerms("Net 30")
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      category: category.trim() || "Uncategorised",
      paymentTerms,
    })
    toast.success("Vendor added", { description: name.trim() })
    onClose()
  }

  const openFull = () => {
    onClose()
    navigate("/purchasing/vendors/new")
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add vendor"
      description="Quick add — a name and email is enough to start writing POs. Add terms and lead time later."
      maxHeightVh={82}
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
            <Button type="button" onClick={submit} disabled={!valid}>Add vendor</Button>
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
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Delta Apparel" required />
        </label>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Email</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="orders@delta.com" required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Phone</span>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 803 555 0119" />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Category</span>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Fashion" />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Payment terms</span>
          <Select value={paymentTerms} onValueChange={setPaymentTerms}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Prepay">Prepay</SelectItem>
              <SelectItem value="Net 7">Net 7</SelectItem>
              <SelectItem value="Net 14">Net 14</SelectItem>
              <SelectItem value="Net 30">Net 30</SelectItem>
              <SelectItem value="Net 60">Net 60</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
