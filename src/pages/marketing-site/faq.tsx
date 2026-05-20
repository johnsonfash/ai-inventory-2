import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronDown, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

type Item = { q: string; a: string }

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "Do I need a credit card to try Pallio?",
        a: "No. The free plan is genuinely free — no card, no credit-check, no auto-conversion. You move to a paid plan only when you choose to.",
      },
      {
        q: "Can I import data from my current POS / inventory tool?",
        a: "Yes. Pallio supports CSV import for items, customers, vendors, and purchase orders. A guided importer maps your columns to Pallio's fields. Shopify + WooCommerce one-click sync is in the Growth plan.",
      },
      {
        q: "Does Pallio work offline?",
        a: "Yes. The PWA and native apps cache the catalog + recent transactions. Run sales offline at a pop-up; everything syncs the moment you reconnect.",
      },
    ],
  },
  {
    title: "Pricing + billing",
    items: [
      {
        q: "Are there transaction fees?",
        a: "Pallio doesn't take a transaction fee. You pay your payment processor (Stripe / PayPal / etc.) their normal fee — same as if you wired them yourself.",
      },
      {
        q: "Can I switch between monthly and yearly?",
        a: "Any time. We prorate the difference and credit / charge accordingly.",
      },
      {
        q: "What happens if I downgrade?",
        a: "We keep your data and the features stay enabled until your current billing cycle ends. After that, anything outside the new plan's limits goes read-only — never deleted.",
      },
    ],
  },
  {
    title: "Features + roadmap",
    items: [
      {
        q: "Is the AI assistant a real model or a marketing label?",
        a: "It's a hybrid. Rule-based heuristics handle the common cases (low stock, vendor lateness, margin drift) deterministically. A real LLM handles the chat surface in the AI Assistant page. Insights are never trained on YOUR data — they reason over it at request time.",
      },
      {
        q: "Can I run multiple locations?",
        a: "Yes. The free plan covers 1 location, Growth 3, Scale unlimited. Stock + sales + reports attribute to whichever location they belong to.",
      },
      {
        q: "Do you have an API?",
        a: "Yes — REST API with API keys, webhooks for inbound events, and a custom-website integration for storefronts. Available on every plan.",
      },
    ],
  },
  {
    title: "Security + data",
    items: [
      {
        q: "Where is my data stored?",
        a: "By default, in our primary US data centre with daily encrypted backups. EU + AU regions are available on Scale plans for data-residency requirements.",
      },
      {
        q: "Does Pallio train on my data?",
        a: "No. Your data is never used to train any model. The AI assistant reasons over your data at request time and the conversation is discarded after the response is delivered.",
      },
      {
        q: "Can I export everything?",
        a: "Always. Full CSV export of every entity (items, customers, orders, invoices, POs, …) is one click from the Settings page. You own your data — Pallio is just where you work on it.",
      },
    ],
  },
]

export default function FaqPage() {
  React.useEffect(() => {
    document.title = "FAQ — Pallio"
  }, [])

  return (
    <div className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Questions, answered
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">FAQ</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            If your question isn't here, our team is one tap away.
          </p>
        </motion.div>

        <div className="mt-12 flex flex-col gap-10">
          {SECTIONS.map((sec, si) => (
            <section key={sec.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {sec.title}
              </h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {sec.items.map((it, i) => (
                  <FaqItem key={it.q} item={it} initialOpen={si === 0 && i === 0} />
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Help CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-8 text-center dark:from-primary/10 dark:to-emerald-950/15">
          <h2 className="text-xl font-bold tracking-tight">Still stuck?</h2>
          <p className="mt-2 text-muted-foreground">
            We answer every email + every chat. Average response &lt; 2 hours during business hours.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact">
              <Button>
                <Mail className="h-4 w-4" /> Email us
              </Button>
            </Link>
            <Link to="/contact#chat">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4" /> Open chat
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function FaqItem({ item, initialOpen = false }: { item: Item; initialOpen?: boolean }) {
  const [open, setOpen] = React.useState(initialOpen)
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="text-sm font-semibold md:text-base">{item.q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
