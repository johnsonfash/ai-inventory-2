import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownToLine,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/contexts/currency"
import { useAutoMarkStep } from "@/hooks/use-auto-mark-step"

type Method = {
  href?: string
  name: string
  Icon: LucideIcon
  description: string
  status: "connected" | "available" | "off"
  fees?: string
  tone: "violet" | "emerald" | "amber" | "sky" | "neutral"
}

const TONES = {
  violet: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground",
} as const

const methods: Method[] = [
  { href: "/settings/integrations/stripe", name: "Card · Stripe", Icon: CreditCard, description: "Process Visa, Mastercard, Amex.", status: "connected", fees: "2.9% + 30¢", tone: "violet" },
  { name: "Cash", Icon: Banknote, description: "In-person cash drawer.", status: "connected", fees: "—", tone: "emerald" },
  { name: "Bank transfer", Icon: Building2, description: "ACH / SEPA via virtual account.", status: "connected", fees: "Free", tone: "sky" },
  { href: "/settings/integrations/paypal", name: "PayPal", Icon: Wallet, description: "PayPal balance + Pay Later.", status: "available", fees: "3.49% + fixed fee", tone: "amber" },
  { name: "Apple Pay / Google Pay", Icon: Smartphone, description: "Tap-to-pay on supported devices.", status: "available", fees: "Routes through Stripe", tone: "neutral" },
]

const statusTone: Record<Method["status"], StatusTone> = { connected: "success", available: "neutral", off: "danger" }

export default function PaymentsSettings() {
  useAutoMarkStep("payments")
  const { formatPrice } = useCurrency()
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const connected = methods.filter((m) => m.status === "connected").length

  return (
    <PageShell
      title="Payment methods"
      withToolbar={false}
      titleTooltip={
        <>
          Which payment rails Pallio accepts at the till + checkout —
          card (via Paystack / Flutterwave / Stripe), bank transfer,
          cash, and wallets like Opay / PalmPay. Each one can be
          turned on or off per location.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Active", value: String(connected), tone: "success", hint: "accepted" },
            { label: "Volume (30d)", value: formatPrice(48210), tone: "brand", hint: "this period" },
            { label: "Avg fees", value: "1.4%", tone: "warning", hint: "blended" },
            { label: "Refunds", value: formatPrice(420), tone: "info", hint: "this period" },
          ]}
        />

        {/* Methods */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight md:text-lg">Methods</h3>
              <p className="text-xs text-muted-foreground md:text-sm">Pick what your customers can use at checkout.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {methods.map((m) => {
              const Icon = m.Icon
              const inner = (
                <>
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[m.tone])}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{m.name}</p>
                        {m.status === "connected" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> On
                          </span>
                        ) : (
                          <StatusBadge tone={statusTone[m.status]}>{m.status}</StatusBadge>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{m.description}</p>
                      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">Fees: {m.fees}</p>
                    </div>
                    {m.href && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </div>
                </>
              )
              return m.href ? (
                <Link key={m.name} to={m.href} className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm">
                  {inner}
                </Link>
              ) : (
                <div key={m.name} className="rounded-2xl border border-border bg-card p-4">
                  {inner}
                </div>
              )
            })}
          </div>
        </section>

        {/* Quick links */}
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold tracking-tight md:text-lg">Related</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Link to="/settings/payments/accounts" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Building2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Withdrawal accounts</p>
                  <p className="text-[11px] text-muted-foreground">Where revenue lands.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/settings/payments/withdrawals" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  <ArrowDownToLine className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Withdrawals</p>
                  <p className="text-[11px] text-muted-foreground">History of payouts to your bank.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link to="/settings/payments/locations" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                  <DollarSign className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Per-location settings</p>
                  <p className="text-[11px] text-muted-foreground">Configure methods per storefront.</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
