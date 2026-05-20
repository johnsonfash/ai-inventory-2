import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/info-tooltip"

type Tier = {
  id: string
  name: string
  blurb: string
  monthly: number
  yearly: number
  cta: string
  highlight?: boolean
  features: string[]
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Everything you need to test-drive Pallio. No credit card.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    features: [
      "Up to 100 SKUs",
      "1 location",
      "1 cashier",
      "Manual POS + receipts",
      "Basic reporting",
      "Community support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "Most popular. For shops that have moved past the spreadsheet.",
    monthly: 29,
    yearly: 290,
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "Unlimited SKUs",
      "Up to 3 locations",
      "Up to 5 team members",
      "AI insights + 7-day forecast",
      "Suggested restock + smart POs",
      "Marketing — FB / IG / YouTube",
      "Email + chat support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    blurb: "For multi-location operators with a sales team + affiliates.",
    monthly: 79,
    yearly: 790,
    cta: "Start 14-day trial",
    features: [
      "Unlimited everything",
      "Unlimited locations",
      "Unlimited team + role-based invites",
      "Affiliate program + payouts",
      "Advanced AI: anomaly + cashflow forecast",
      "Rich email + template editor",
      "Priority support + SLA",
      "Single sign-on (SSO)",
    ],
  },
]

const COMPARISON: { feature: string; values: [string | boolean, string | boolean, string | boolean]; tip?: string }[] = [
  { feature: "Inventory items (SKUs)", values: ["100", "Unlimited", "Unlimited"] },
  { feature: "Locations", values: ["1", "3", "Unlimited"] },
  { feature: "Team members", values: ["1", "5", "Unlimited"] },
  { feature: "Point of sale", values: [true, true, true] },
  { feature: "Composite items + bundles", values: [false, true, true] },
  { feature: "AI insights + forecast", values: [false, true, true], tip: "Restock suggestions, vendor lateness flags, ROAS spikes, cashflow forecast. Trained on your own data, never shared." },
  { feature: "Marketing (Ads + Marketplace)", values: [false, true, true] },
  { feature: "Affiliate program", values: [false, false, true], tip: "Generate unique affiliate links, attribute sales, and pay out commissions automatically." },
  { feature: "Rich email + templates", values: [false, false, true] },
  { feature: "Custom roles + permissions", values: [false, true, true] },
  { feature: "Single sign-on (SSO)", values: [false, false, true] },
  { feature: "Priority support + SLA", values: [false, false, true] },
]

const ADDONS = [
  { name: "Extra location", price: "+$15 / mo each" },
  { name: "Extra team member (Growth)", price: "+$8 / mo each" },
  { name: "Branded receipt + email theme", price: "+$15 / mo" },
  { name: "Custom domain (storefront)", price: "+$10 / mo" },
  { name: "Advanced reporting export (raw)", price: "+$20 / mo" },
]

export default function PricingPage() {
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("yearly")

  React.useEffect(() => {
    document.title = "Pricing — Pallio"
  }, [])

  return (
    <div className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Simple, honest pricing
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
            Free to start.
            <br />
            <span className="bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
              Pay when you grow.
            </span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            One transparent price. No per-transaction fees. Cancel any time. Annual plans save you ~17%.
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
                    Save 17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
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
                <span className="text-4xl font-extrabold tracking-tight">
                  {tier.monthly === 0 ? "Free" : `$${billing === "monthly" ? tier.monthly : Math.round(tier.yearly / 12)}`}
                </span>
                {tier.monthly > 0 && (
                  <span className="text-sm text-muted-foreground">/ month</span>
                )}
              </div>
              {tier.monthly > 0 && billing === "yearly" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Billed ${tier.yearly}/yr · save ${tier.monthly * 12 - tier.yearly}/yr
                </p>
              )}

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
          ))}
        </div>

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
                            <span className="text-muted-foreground/60">—</span>
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
            We have a long FAQ + an even longer-suffering team email.
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
