import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Banknote, CheckCircle2, CreditCard, Smartphone, Tag, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InputAddon } from "@/components/forms/input-addon"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { Invoice, Payment, PaymentMethod } from "@/lib/sales/types"

type Props = {
  open: boolean
  invoice: Invoice
  onClose: () => void
  /** Fires with the recorded payment shape. Caller persists / closes. */
  onRecord: (p: Omit<Payment, "id" | "invoiceId" | "recordedById">) => void
}

const METHODS: { key: PaymentMethod; label: string; Icon: React.ElementType; tone: string }[] = [
  { key: "card",         label: "Card",          Icon: CreditCard, tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary" },
  { key: "cash",         label: "Cash",          Icon: Banknote,   tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { key: "transfer",     label: "Bank transfer", Icon: Wallet,     tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { key: "wallet",       label: "Wallet",        Icon: Smartphone, tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" },
  { key: "store-credit", label: "Store credit",  Icon: Tag,        tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
]

// Reusable record-payment modal. Used from the invoice detail page;
// will also be reachable from /pos/transactions reconciliation
// flow later. Builds a payment object via onRecord — parent is in
// charge of persisting + closing.
//
// Dual-face: bottom sheet on mobile, centred modal on desktop.
export function RecordPaymentModal({ open, invoice, onClose, onRecord }: Props) {
  const isMobile = useIsMobile()
  const [method, setMethod] = React.useState<PaymentMethod>("card")
  const [amount, setAmount] = React.useState<string>(invoice.balanceUsd.toFixed(2))
  const [reference, setReference] = React.useState("")
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  // Reset when opening fresh.
  React.useEffect(() => {
    if (!open) return
    setMethod("card")
    setAmount(invoice.balanceUsd.toFixed(2))
    setReference("")
    setNote("")
    setSubmitting(false)
  }, [open, invoice.id, invoice.balanceUsd])

  // Scroll lock + Escape close.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const numericAmount = Math.max(0, Number(amount) || 0)
  const balanceAfter = Math.max(0, invoice.balanceUsd - numericAmount)
  const wouldClose = balanceAfter <= 0.005
  const overpay = numericAmount > invoice.balanceUsd + 0.005

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (numericAmount <= 0) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 350))
    onRecord({
      amountUsd: numericAmount,
      method,
      paidAt: new Date().toISOString(),
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
    })
  }

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className={cn(
            "fixed inset-0 z-[90] flex bg-black/60 backdrop-blur-md",
            isMobile ? "items-end" : "items-center justify-center px-4 py-6",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={`Record payment for invoice ${invoice.number}`}
          onClick={onClose}
        >
          <motion.form
            initial={isMobile ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            animate={isMobile ? { y: 0 }     : { y: 0,  opacity: 1, scale: 1 }}
            exit={isMobile    ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className={cn(
              "flex w-full max-w-md flex-col overflow-hidden bg-card text-foreground shadow-2xl shadow-black/40",
              isMobile ? "rounded-t-3xl max-h-[88dvh]" : "rounded-2xl border border-border",
            )}
          >
            {/* Header */}
            <header className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 px-5 py-4 dark:from-primary/10 dark:to-emerald-950/15">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/30 blur-3xl dark:bg-primary/30" aria-hidden />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Invoice {invoice.number}
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight">Record a payment</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {invoice.customer.name} · Balance{" "}
                <span className="font-semibold text-foreground">${invoice.balanceUsd.toFixed(2)}</span>{" "}
                of <span className="font-semibold">${invoice.totalUsd.toFixed(2)}</span>
              </p>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Method picker */}
              <p className="text-xs font-semibold text-foreground/80">Method</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {METHODS.map((m) => {
                  const selected = m.key === method
                  return (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors",
                        selected
                          ? "border-brand bg-brand-soft dark:border-primary dark:bg-primary/10"
                          : "border-border bg-background hover:border-brand/40",
                      )}
                    >
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", m.tone)}>
                        <m.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Amount */}
              <label className="mt-5 flex flex-col gap-1.5 text-xs">
                <span className="font-semibold text-foreground/80">Amount</span>
                <InputAddon leading="$">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </InputAddon>
                <span className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Balance after:{" "}
                    <span className={cn("font-semibold tabular-nums", balanceAfter > 0 ? "text-foreground" : "text-emerald-700 dark:text-emerald-300")}>
                      ${balanceAfter.toFixed(2)}
                    </span>
                  </span>
                  {!wouldClose && (
                    <button
                      type="button"
                      onClick={() => setAmount(invoice.balanceUsd.toFixed(2))}
                      className="font-semibold text-brand hover:underline dark:text-primary"
                    >
                      Pay in full
                    </button>
                  )}
                </span>
              </label>

              {/* Reference */}
              <label className="mt-4 flex flex-col gap-1.5 text-xs">
                <span className="font-semibold text-foreground/80">
                  Reference {method === "card" ? "(charge id)" : method === "transfer" ? "(ACH / wire ref)" : "(optional)"}
                </span>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={method === "card" ? "ch_3abc…" : method === "transfer" ? "ACH-7841" : "—"}
                />
              </label>

              {/* Note */}
              <label className="mt-4 flex flex-col gap-1.5 text-xs">
                <span className="font-semibold text-foreground/80">Internal note</span>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything you want recorded against this payment…"
                  rows={2}
                />
              </label>

              {/* Receipt heads-up */}
              {wouldClose && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-foreground/80">
                    This closes the invoice. Pallio auto-issues a receipt + emails it to {invoice.customer.email}.
                  </p>
                </div>
              )}
              {overpay && (
                <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                  Heads up: this is <strong>more</strong> than the outstanding balance. The excess will land as store credit.
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting || numericAmount <= 0}>
                {submitting ? "Recording…" : "Record payment"}
              </Button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
