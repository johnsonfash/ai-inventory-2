import * as React from "react"
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Gift,
  HandCoins,
  Plus,
  Smartphone,
  Sparkles,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"
import type { PaymentLine } from "@/lib/pos/storage"
import { getGiftCard, getLoyalty, loyaltyIdFor } from "@/lib/pos/loyalty"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

type PaymentMethod = PaymentLine["method"]

const METHODS: { value: PaymentMethod; label: string; Icon: LucideIcon }[] = [
  { value: "cash", label: "Cash", Icon: Banknote },
  { value: "card", label: "Card", Icon: CreditCard },
  { value: "gift-card", label: "Gift card", Icon: Gift },
  { value: "store-credit", label: "Store credit", Icon: Wallet },
  { value: "paypal", label: "PayPal", Icon: Smartphone },
  { value: "stripe", label: "Stripe", Icon: Smartphone },
  { value: "other", label: "Other", Icon: Building2 },
]

// Common cash-tender amounts to make the keypad quick.
const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200]

// Tip percentages offered as one-tap presets. Applied to the pre-tip
// total. POS-1.
const TIP_PRESETS = [10, 15, 20]

type Props = {
  open: boolean
  onClose: () => void
  /** Total BEFORE tip. The sheet adds any tip on top. */
  total: number
  tip: number
  onTipChange: (next: number) => void
  /** Show tip presets up-front (food / services). Other modes get a
   *  compact "Add a tip" toggle so retail isn't nagged. */
  tipSuggested?: boolean
  payments: PaymentLine[]
  onAddPayment: () => void
  onRemovePayment: (idx: number) => void
  onUpdatePayment: (idx: number, part: Partial<PaymentLine>) => void
  onConfirm: () => void
  /** Optional virtual-account display info (bank + account number). */
  virtualAccount?: { bank: string; accountNumber: string; accountName: string } | null
  /** Attached customer — drives store-credit + loyalty (POS-2). */
  customer?: { name?: string; email?: string; phone?: string }
  /** Redeem the customer's points into store credit. POS-2. */
  onRedeemPoints?: (id: string, points: number) => void
}

export function CheckoutSheet({
  open,
  onClose,
  total,
  tip,
  onTipChange,
  tipSuggested,
  payments,
  onAddPayment,
  onRemovePayment,
  onUpdatePayment,
  onConfirm,
  virtualAccount,
  customer,
  onRedeemPoints,
}: Props) {
  const { formatPrice, symbol } = useCurrency()
  const grandTotal = Math.round((total + (tip || 0)) * 100) / 100
  const paid = payments.reduce((s, p) => s + (Number.isFinite(p.amount) ? p.amount : 0), 0)
  const remaining = Math.max(0, Math.round((grandTotal - paid) * 100) / 100)
  // Loyalty / store-credit for the attached customer (re-read each render
  // so a points redemption reflects immediately).
  const loyaltyId = loyaltyIdFor(customer)
  const account = loyaltyId ? getLoyalty(loyaltyId) : undefined
  const change = Math.max(0, Math.round((paid - grandTotal) * 100) / 100)
  const fullyPaid = paid >= grandTotal

  // "Add a tip" reveal for modes where tips aren't suggested by default.
  const [tipOpen, setTipOpen] = React.useState(false)
  const showTipBlock = tipSuggested || tipOpen || (tip || 0) > 0
  // Which preset is active (for highlight) — derived, not stored.
  const activePreset = TIP_PRESETS.find(
    (p) => Math.abs(Math.round(total * p) / 100 - (tip || 0)) < 0.005,
  )

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
      description={tip > 0 ? `Total ${formatPrice(grandTotal)} (incl. ${formatPrice(tip)} tip)` : `Total ${formatPrice(grandTotal)}`}
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
        {/* Loyalty — only when a known customer is attached */}
        {account && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-brand/30 bg-brand-soft/50 p-3 dark:bg-primary/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand dark:text-primary" />
              <div className="text-xs">
                <p className="font-semibold">{account.name || account.id}</p>
                <p className="text-muted-foreground">
                  {account.points} pts
                  {account.storeCredit > 0 && <> · {formatPrice(account.storeCredit)} credit</>}
                </p>
              </div>
            </div>
            {onRedeemPoints && account.points > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRedeemPoints(account.id, account.points)}
              >
                Redeem points
              </Button>
            )}
          </div>
        )}

        {/* Tip / gratuity */}
        {showTipBlock ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tip
              </p>
              {(tip || 0) > 0 && (
                <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{formatPrice(tip)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {TIP_PRESETS.map((pct) => {
                const amt = Math.round(total * pct) / 100
                const active = activePreset === pct
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onTipChange(active ? 0 : amt)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "border-brand bg-brand text-brand-foreground dark:border-primary dark:bg-primary dark:text-primary-foreground"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    {pct}%
                  </button>
                )
              })}
              <div className="flex items-center rounded-xl border border-input bg-background pl-2">
                <span className="text-xs text-muted-foreground">{symbol}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={tip === 0 ? "" : tip}
                  onChange={(e) => onTipChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0))}
                  placeholder="Custom"
                  min={0}
                  step="0.01"
                  className="h-full w-full bg-transparent px-1 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setTipOpen(true)}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <HandCoins className="h-3.5 w-3.5" /> Add a tip
          </button>
        )}

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
              onClick={() => setQuick(grandTotal)}
              className="col-span-3 rounded-xl border border-brand/30 bg-brand-soft py-2.5 text-sm font-semibold tabular-nums text-brand transition-colors hover:bg-brand/10 dark:bg-primary/15 dark:text-primary"
            >
              Exact {formatPrice(grandTotal)}
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
            {payments.map((p, idx) => {
              // What still needs covering if this line were emptied —
              // used to cap gift-card / store-credit applications.
              const others = paid - (Number.isFinite(p.amount) ? p.amount : 0)
              const outstanding = Math.max(0, Math.round((grandTotal - others) * 100) / 100)
              return (
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
                        onClick={() => onUpdatePayment(idx, { method: m.value, amount: 0, reference: "" })}
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

                {p.method === "gift-card" ? (
                  <GiftCardTender
                    code={p.reference || ""}
                    amount={p.amount}
                    outstanding={outstanding}
                    onChange={(part) => onUpdatePayment(idx, part)}
                  />
                ) : p.method === "store-credit" ? (
                  <StoreCreditTender
                    available={account?.storeCredit ?? 0}
                    hasCustomer={!!loyaltyId}
                    amount={p.amount}
                    outstanding={outstanding}
                    onApply={(amt) => onUpdatePayment(idx, { amount: amt, reference: "Store credit" })}
                  />
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-10 flex-1 items-center rounded-lg border border-input bg-background pl-3">
                      <span className="text-sm text-muted-foreground">{symbol}</span>
                      <input
                        type="number"
                        value={p.amount === 0 ? "" : p.amount}
                        onChange={(e) => onUpdatePayment(idx, { amount: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
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
                )}

                {(p.method === "gift-card" || p.method === "store-credit") && payments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemovePayment(idx)}
                    className="mt-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    Remove this split
                  </button>
                )}
              </li>
              )
            })}
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

// Gift-card tender: type the code, Apply pulls the live balance and
// fills the amount (capped to what's still owed). The actual deduction
// happens at sale confirmation, not here. POS-2.
function GiftCardTender({
  code,
  amount,
  outstanding,
  onChange,
}: {
  code: string
  amount: number
  outstanding: number
  onChange: (part: Partial<PaymentLine>) => void
}) {
  const { formatPrice } = useCurrency()
  const card = code.trim() ? getGiftCard(code) : undefined
  const apply = () => {
    if (!card || card.status === "void") return
    onChange({ amount: Math.min(card.currentBalance, outstanding) })
  }
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Gift card code"
          value={code}
          onChange={(e) => onChange({ reference: e.target.value, amount: 0 })}
          className="flex-1 font-mono"
        />
        <Button type="button" variant="outline" onClick={apply} disabled={!card || card.status === "void"}>
          Apply
        </Button>
      </div>
      {code.trim() && !card && (
        <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">No card with that code.</p>
      )}
      {card && (
        <p className="text-[11px] text-muted-foreground">
          Balance {formatPrice(card.currentBalance)}
          {card.status === "void" && " · voided"}
          {amount > 0 && (
            <span className="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">
              · applying {formatPrice(amount)}
            </span>
          )}
        </p>
      )}
    </div>
  )
}

// Store-credit tender: shows the attached customer's balance and applies
// as much as is owed. POS-2.
function StoreCreditTender({
  available,
  hasCustomer,
  amount,
  outstanding,
  onApply,
}: {
  available: number
  hasCustomer: boolean
  amount: number
  outstanding: number
  onApply: (amt: number) => void
}) {
  const { formatPrice } = useCurrency()
  if (!hasCustomer) {
    return (
      <p className="mt-2 text-[11px] text-muted-foreground">
        Attach a customer (with email or phone) to use store credit.
      </p>
    )
  }
  const usable = Math.min(available, outstanding)
  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      <p className="text-[11px] text-muted-foreground">
        Available {formatPrice(available)}
        {amount > 0 && (
          <span className="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">
            · using {formatPrice(amount)}
          </span>
        )}
      </p>
      <Button type="button" variant="outline" size="sm" disabled={usable <= 0} onClick={() => onApply(usable)}>
        Use {formatPrice(usable)}
      </Button>
    </div>
  )
}
