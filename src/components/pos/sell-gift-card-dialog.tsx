import * as React from "react"
import { Gift } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"

// Sell a gift card: pick (or type) an amount; it's added to the cart as
// a non-taxable line. The actual card (with a code + balance) is issued
// when the sale completes. POS-2.
const PRESETS = [10, 25, 50, 100]

export function SellGiftCardDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (amount: number) => void
}) {
  const { formatPrice, symbol } = useCurrency()
  const [amount, setAmount] = React.useState("")

  React.useEffect(() => {
    if (open) setAmount("")
  }, [open])

  const amt = Number(amount) || 0
  const submit = () => {
    if (amt <= 0) return
    onConfirm(Math.round(amt * 100) / 100)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
            <Gift className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-semibold">Sell a gift card</p>
            <p className="text-[11px] text-muted-foreground">
              A code is generated when the sale is paid.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className="rounded-xl border border-border bg-card py-2.5 text-sm font-semibold tabular-nums transition-colors hover:bg-accent"
            >
              {formatPrice(p)}
            </button>
          ))}
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Custom amount</span>
          <div className="flex h-10 items-center rounded-lg border border-input bg-background pl-3">
            <span className="text-sm text-muted-foreground">{symbol}</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={0}
              step="0.01"
              className="h-full w-full bg-transparent px-2 text-sm outline-none"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit} disabled={amt <= 0}>
            Add to cart · {formatPrice(amt)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
