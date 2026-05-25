import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/contexts/currency"

export type QuickExpense = {
  category: string
  vendor: string
  amount: number
  date: string
  method: "card" | "cash" | "transfer"
}

const CATEGORIES = ["Logistics", "Marketing", "Payroll", "Rent", "Utilities", "Other"] as const

// Quick-capture expense overlay. Expenses get logged fast and often, so the
// common case (category + amount + date + vendor) shouldn't cost a page
// load. Receipt photo, reimbursable flag, currency, payment method and notes
// live on the full /expenses/new page, one tap away via "More details".
// Drawer on mobile, centred modal on desktop.
export function AddExpenseDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (e: QuickExpense) => void
}) {
  const navigate = useNavigate()
  const { symbol } = useCurrency()
  const today = new Date().toISOString().slice(0, 10)
  const [category, setCategory] = React.useState<string>("Logistics")
  const [vendor, setVendor] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [date, setDate] = React.useState(today)
  const [method, setMethod] = React.useState<QuickExpense["method"]>("card")

  const numericAmount = Math.max(0, Number(amount) || 0)
  const valid = numericAmount > 0

  React.useEffect(() => {
    if (!open) return
    setCategory("Logistics")
    setVendor("")
    setAmount("")
    setDate(today)
    setMethod("card")
    // `today` is recomputed each render but only read on open; deps kept
    // minimal so a midnight rollover doesn't thrash the reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () => {
    if (!valid) return
    onCreate({ category, vendor: vendor.trim() || "—", amount: numericAmount, date, method })
    toast.success("Expense logged", { description: `${category} · ${vendor.trim() || "—"}` })
    onClose()
  }

  const openFull = () => {
    onClose()
    navigate("/expenses/new")
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Log an expense"
      description="Quick entry. Attach a receipt or mark it reimbursable under More details."
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
            <Button type="button" onClick={submit} disabled={!valid}>Log expense</Button>
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
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Amount</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{symbol}</span>
              <Input
                autoFocus
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Vendor / payee</span>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="DHL, NEPA, landlord…" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Category</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Paid with</span>
            <Select value={method} onValueChange={(v) => setMethod(v as QuickExpense["method"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Bank transfer</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
