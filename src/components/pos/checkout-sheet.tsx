import * as React from "react"
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Plus,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react"
import type { PaymentLine } from "@/lib/pos/storage"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type PaymentMethod = PaymentLine["method"]

const METHODS: { value: PaymentMethod; label: string; Icon: LucideIcon }[] = [
  { value: "cash", label: "Cash", Icon: Banknote },
  { value: "card", label: "Card", Icon: CreditCard },
  { value: "paypal", label: "PayPal", Icon: Smartphone },
  { value: "stripe", label: "Stripe", Icon: Smartphone },
  { value: "other", label: "Other", Icon: Building2 },
]

// Common cash-tender amounts to make the keypad quick.
const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200]

type Props = {
  open: boolean
  onClose: () => void
  total: number
  payments: PaymentLine[]
  onAddPayment: () => void
  onRemovePayment: (idx: number) => void
  onUpdatePayment: (idx: number, part: Partial<PaymentLine>) => void
  onConfirm: () => void
  /** Optional virtual-account display info (bank + account number). */
  virtualAccount?: { bank: string; accountNumber: string; accountName: string } | null
}

export function CheckoutSheet({
  open,
  onClose,
  total,
  payments,
  onAddPayment,
  onRemovePayment,
  onUpdatePayment,
  onConfirm,
  virtualAccount,
}: Props) {
  const paid = payments.reduce((s, p) => s + (Number.isFinite(p.amount) ? p.amount : 0), 0)
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100)
  const change = Math.max(0, Math.round((paid - total) * 100) / 100)
  const fullyPaid = paid >= total
  const { formatPrice, symbol } = useCurrency()

  const setQuick = (amount: number) => {
    // Fill the first cash line, or add one if none exists.
    const cashIdx = payments.findIndex((p) => p.method === "cash")
    if (cashIdx >= 0) {
      onUpdatePayment(cashIdx, { amount })
    } else if (payments.length === 1 && payments[0]!.amount === 0) {
      onUpdatePayment(0, { method: "cash", amount })
    } else {
      onAddPayment()
      // The newly-added line is at the end, but onAddPayment is async-ish via setState.
      // Updating happens on the next render via parent state — caller hooks it up.
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Checkout"
      description={`Total ${formatPrice(total)}`}
      maxHeightVh={92}
      footer={
        <div className="flex flex-col gap-2 pb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {remaining > 0 ? "Remaining" : change > 0 ? "Change due" : "Settled"}
            </span>
            <span className={cn("text-base font-bold tabular-nums", remaining > 0 ? "text-amber-600 dark:text-amber-400" : change > 0 ? "text-emerald-600 dark:text-emerald-400" : "")}>
              {formatPrice(remaining > 0 ? remaining : change)}
            </span>
          </div>
          <Button type="button" onClick={onConfirm} disabled={!fullyPaid} className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            {fullyPaid ? "Complete sale" : "Add more payment"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Quick cash amounts */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick cash
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setQuick(amount)}
                className="rounded-xl border border-border bg-card py-2.5 text-sm font-semibold tabular-nums transition-colors hover:border-brand/40 hover:bg-accent"
              >
                {formatPrice(amount)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuick(total)}
              className="col-span-3 rounded-xl border border-brand/30 bg-brand-soft py-2.5 text-sm font-semibold tabular-nums text-brand transition-colors hover:bg-brand/10 dark:bg-primary/15 dark:text-primary"
            >
              Exact {formatPrice(total)}
            </button>
          </div>
        </div>

        {/* Payment lines */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment lines
            </p>
            <button
              type="button"
              onClick={onAddPayment}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-brand hover:bg-brand-soft dark:text-primary dark:hover:bg-primary/15"
            >
              <Plus className="h-3.5 w-3.5" /> Add split
            </button>
          </div>
          <ul className="space-y-2">
            {payments.map((p, idx) => (
              <li key={idx} className="rounded-xl border border-border bg-background p-3">
                {/* Method pills */}
                <div className="flex flex-wrap gap-1.5">
                  {METHODS.map((m) => {
                    const Icon = m.Icon
                    const active = p.method === m.value
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => onUpdatePayment(idx, { method: m.value })}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          active
                            ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                            : "border border-border bg-card text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" /> {m.label}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-10 flex-1 items-center rounded-lg border border-input bg-background pl-3">
                    <span className="text-sm text-muted-foreground">{symbol}</span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => onUpdatePayment(idx, { amount: Number(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-full w-full bg-transparent px-2 text-sm outline-none"
                    />
                  </div>
                  <Input
                    placeholder="Reference (opt)"
                    value={p.reference || ""}
                    onChange={(e) => onUpdatePayment(idx, { reference: e.target.value })}
                    className="hidden flex-1 sm:block"
                  />
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemovePayment(idx)}
                      aria-label="Remove split"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {virtualAccount && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
            <p className="mb-1 font-semibold">Virtual account (for transfers)</p>
            <p className="text-muted-foreground">
              {virtualAccount.bank} · <span className="font-mono">{virtualAccount.accountNumber}</span>
            </p>
            <p className="text-muted-foreground">{virtualAccount.accountName}</p>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
