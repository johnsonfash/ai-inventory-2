import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Check, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/info-tooltip"

type Tier = {
  id: string
  name: string
  blurb: string
  /** Monthly price in Naira. */
  monthly: number
  /** Annual price in Naira (savings vs 12 × monthly). */
  yearly: number
  cta: string
  highlight?: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "Everything an independent shop needs to leave the spreadsheet behind.",
    monthly: 2_000,
    yearly: 20_000,  // 12-mo price ≈ 2 free months
    cta: "Start free for 1 month",
    features: [
      "Up to 3 locations",
      "Up to 5 team members",
      "Unlimited SKUs",
      "Full POS + receipts",
      "Inventory + suggested restock",
      "Sales + purchasing",
      "Basic reporting",
      "Email + chat support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "Most popular. For multi-shop SMBs with a sales team + ad spend.",
    monthly: 5_000,
    yearly: 50_000,
    cta: "Start free for 1 month",
    highlight: true,
    features: [
      "Up to 10 locations",
      "Up to 25 team members",
      "Everything in Starter",
      "AI insights + 7-day forecast",
      "Smart restock + auto-POs",
      "Marketing across Facebook, Instagram, YouTube + Marketplace",
      "Custom email templates + rich editor",
      "Role-based access (Cashier / Sales rep / Marketer)",
      "Priority email + chat support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    blurb: "For multi-location operators with affiliates + a real ad team.",
    monthly: 10_000,
    yearly: 100_000,
    cta: "Start free for 1 month",
    features: [
      "Unlimited locations",
      "Unlimited team members",
      "Affiliate program + payouts",
      "Advanced AI (anomaly detection, cashflow forecast)",
      "Single sign-on (SSO)",
      "Audit log + retained for 1 year",
      "White-label invoices + receipts",
      "Priority phone + WhatsApp support",
      "SLA-backed uptime",
    ],
  },
]

const COMPARISON: { feature: string; values: [string | boolean, string | boolean, string | boolean]; tip?: string }[] = [
  { feature: "Locations",            values: ["3", "10", "Unlimited"] },
  { feature: "Team members",         values: ["5", "25", "Unlimited"] },
  { feature: "Inventory items (SKUs)", values: ["Unlimited", "Unlimited", "Unlimited"] },
  { feature: "Point of sale",        values: [true, true, true] },
  { feature: "Composite items + bundles", values: [true, true, true] },
  { feature: "AI insights + forecast", values: [false, true, true], tip: "Restock suggestions, vendor lateness flags, ROAS spikes, cashflow forecast. Reads your own numbers when you ask. Never used to train any model." },
  { feature: "Marketing (Ads + Marketplace)", values: [false, true, true] },
  { feature: "Affiliate program",    values: [false, false, true], tip: "Generate unique referral links, attribute sales automatically, and pay out commissions in one click from Settings → Payments → Withdrawals." },
  { feature: "Rich email + templates", values: [true, true, true] },
  { feature: "Custom roles + permissions", values: ["Basic", "Yes", "Yes"] },
  { feature: "Single sign-on (SSO)", values: [false, false, true] },
  { feature: "Audit log",            values: [false, "30 days", "1 year"] },
  { feature: "Priority support + SLA", values: [false, false, true] },
]

const ADDONS = [
  { name: "Extra location", price: "+₦500 / mo each" },
  { name: "Extra team member", price: "+₦300 / mo each" },
  { name: "Branded receipt + email theme", price: "+₦1,000 / mo" },
  { name: "Custom domain (storefront)", price: "+₦800 / mo" },
  { name: "Advanced reporting export (raw)", price: "+₦1,500 / mo" },
  { name: "WhatsApp Business API", price: "+₦2,500 / mo" },
]

function fmtNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`
}

export default function PricingPage() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly")

  React.useEffect(() => {
    document.title = "Pricing · Pallio"
  }, [])

  return (
    <div className="px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Free-trial banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-brand-soft/40 p-4 md:items-center dark:from-emerald-950/15 dark:to-primary/10"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Gift className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight md:text-base">
              <span className="text-emerald-700 dark:text-emerald-300">1 month free.</span>{" "}
              Full <strong>Scale</strong> features. No card.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every Pallio account starts with 30 days of Scale-tier access. Pick a plan to continue after, or cancel any time.
            </p>
          </div>
          <Link to="/dashboard" className="hidden shrink-0 sm:inline-flex">
            <Button size="sm">
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Naira pricing for Nigerian SMBs
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
            Honest pricing.
            <br />
            <span className="bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
              No transaction fees.
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Pay your payment processor what they charge. Pallio doesn't take a cut. Cancel any time. Annual plans get you 2 free months.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors " +
                  (billing === b
                    ? "bg-brand text-brand-foreground shadow dark:bg-primary dark:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {b}
                {b === "yearly" && billing !== "yearly" && (
                  <span className="ml-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                    2 months free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const display = billing === "monthly" ? tier.monthly : Math.round(tier.yearly / 12)
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06, type: "spring", damping: 24, stiffness: 220 }}
                className={
                  "relative flex flex-col rounded-2xl border bg-card p-6 transition-all " +
                  (tier.highlight
                    ? "border-brand/60 shadow-2xl shadow-brand/20 ring-1 ring-brand/30 dark:border-primary/60 dark:shadow-primary/15"
                    : "border-border")
                }
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-brand/40">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </span>
                )}
                <h2 className="text-lg font-bold tracking-tight">{tier.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{tier.blurb}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight tabular-nums">
                    {fmtNaira(display)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {billing === "yearly"
                    ? <>Billed {fmtNaira(tier.yearly)}/yr · save {fmtNaira(tier.monthly * 12 - tier.yearly)}/yr</>
                    : <>or {fmtNaira(tier.yearly)} billed yearly (2 months free)</>
                  }
                </p>

                <Link to="/dashboard" className="mt-5">
                  <Button className="w-full" variant={tier.highlight ? "default" : "outline"}>
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {/* Annual-saving callout */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Pricing in Naira (₦). USD + KES + GHS billing coming soon.
        </p>

        {/* Comparison table */}
        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Compare every plan</h2>
            <p className="mt-3 text-muted-foreground">
              All features available in every plan unless noted. Limits scale with the tier.
            </p>
          </div>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  {TIERS.map((t) => (
                    <th key={t.id} className="px-4 py-3 text-center font-semibold">{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {row.feature}
                        {row.tip && <InfoTooltip label={row.feature} size="xs">{row.tip}</InfoTooltip>}
                      </span>
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">·</span>
                          )
                        ) : (
                          <span className="font-semibold tabular-nums">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add-ons */}
        <section className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Optional add-ons</h2>
            <p className="mt-3 text-muted-foreground">Pay only for what you actually need.</p>
          </div>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {ADDONS.map((a) => (
              <li
                key={a.name}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm font-semibold">{a.name}</span>
                <span className="text-sm tabular-nums text-brand dark:text-primary">{a.price}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ teaser */}
        <section className="mt-20 rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-8 text-center dark:from-primary/10 dark:to-emerald-950/15">
          <h3 className="text-xl font-bold tracking-tight">Still have questions?</h3>
          <p className="mt-2 text-muted-foreground">
            We have a long FAQ + an even longer-suffering team WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link to="/faq">
              <Button variant="outline">Read the FAQ</Button>
            </Link>
            <Link to="/contact">
              <Button>Talk to us</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
