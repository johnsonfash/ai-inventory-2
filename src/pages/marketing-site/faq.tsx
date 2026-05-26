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
        q: "Is it really free to start?",
        a: "Yes. Every account begins with 30 days of full access — no card, no credit check, nothing to cancel if you walk away. When the trial ends you pick a plan to keep going, or your account simply pauses (we never delete your data).",
      },
      {
        q: "Will Pallio work for my kind of business?",
        a: "Almost certainly. Pallio is built to be industry-agnostic: it runs a clothing store, a restaurant or café, a pharmacy, a salon, a supermarket, an electronics shop, a workshop or a small factory — and a single account can run several of those at once. Tools you don't need (kitchen prep queue, recipes/production, expiry tracking) simply stay out of your way; nothing is locked off.",
      },
      {
        q: "How long does setup take, and can I bring my data over?",
        a: "Most people are selling the same day. Import your products, customers and suppliers from a CSV with a guided column-mapper, or one-click sync from Shopify or WooCommerce. A Getting Started checklist walks you through the rest.",
      },
      {
        q: "Do I need special hardware?",
        a: "No — the phone or laptop you already have is enough, and your phone's camera can scan barcodes. If you want them, Pallio also supports USB/Bluetooth barcode scanners, thermal receipt printers and cash drawers on desktop and Android.",
      },
      {
        q: "Does Pallio keep working when the network or power drops?",
        a: "Yes. The POS caches your catalogue and keeps ringing up sales offline — at a pop-up, a market stall, or through a power cut. Everything syncs automatically the moment you're back online.",
      },
    ],
  },
  {
    title: "Pricing, billing & credits",
    items: [
      {
        q: "How much does Pallio cost?",
        a: "Three plans: Starter (₦2,000/mo), Growth (₦5,000/mo) and Scale (₦10,000/mo). Pay yearly and two months are free. The full breakdown — including what's in each plan — is on the Pricing page.",
      },
      {
        q: "Does Pallio take a cut of my sales?",
        a: "Never. You pay one flat monthly price for the plan, full stop. Your payment processor (Paystack, Flutterwave, Opay, PalmPay, Stripe, bank transfer…) charges its normal fee just as it would anywhere else — Pallio doesn't add a kobo on top.",
      },
      {
        q: "What are AI credits, and what uses them?",
        a: "Credits power the features that genuinely cost us money to run: the AI assistant, AI ad-copy and ad-video generation, bulk product descriptions, and SMS/email blasts. Each plan includes a monthly allowance (100 / 1,000 / 5,000). If you run low, top up any time — extra credits stay good while your plan is active. Everything else in your plan is unlimited and unmetered.",
      },
      {
        q: "Can I change plans or cancel?",
        a: "Any time, yourself, from Settings — no phone call required. Switching between monthly and yearly is prorated. If you downgrade, your data stays put and anything beyond the new plan's limits goes read-only rather than being deleted.",
      },
      {
        q: "How do my customers pay me?",
        a: "However they like — card, bank transfer, Paystack/Flutterwave/Opay/PalmPay, cash, or a virtual account per till. Pallio records the payment against the sale and your books update automatically.",
      },
    ],
  },
  {
    title: "Features & how it works",
    items: [
      {
        q: "What does Pallio replace?",
        a: "For most businesses: the separate POS, the inventory tool, the stock-count spreadsheet, the accounting software, the email/marketing tool, the affiliate dashboard and the storefront builder. One login, one bill, one set of numbers that always agree.",
      },
      {
        q: "Is the AI real, or just a label?",
        a: "Real, but tuned to be useful rather than chatty. Everyday alerts — low stock, a supplier running late, margin drift, an ad return spiking — come from rules, so they're predictable and instant. The chat assistant uses a proper language model that reasons over your own numbers the moment you ask. Your data is never used to train any model.",
      },
      {
        q: "Does it do proper accounting?",
        a: "Yes — a real double-entry general ledger, not a glorified summary. Sales, returns and bills post to the books automatically, and your P&L, balance sheet, cash flow and VAT return are derived from the ledger rather than typed in. Hand your accountant a GL export, or push to QuickBooks or Xero.",
      },
      {
        q: "Can I run several branches or locations?",
        a: "Yes. Starter covers up to 3 locations, Growth up to 10, and Scale is unlimited. Stock, sales, staff and reports each attribute to the right location, and you can see them all on one screen or drill into one.",
      },
      {
        q: "Can I sell online as well as in person?",
        a: "Yes. Every plan includes a hosted storefront at yourname.pallio.shop, sharing the same catalogue and stock as your POS. Connect your own domain on Growth and Scale.",
      },
      {
        q: "Can staff have different levels of access?",
        a: "Yes. Give cashiers, sales reps, marketers, accountants and managers exactly the access they need with role-based permissions, and lock sensitive actions behind Face ID or fingerprint. Scale adds single sign-on (SSO) and a full audit log.",
      },
      {
        q: "Is there an API?",
        a: "Yes — a REST API with keys, webhooks for inbound events, and a custom-website integration for storefronts. Available on every plan.",
      },
    ],
  },
  {
    title: "Security, data & support",
    items: [
      {
        q: "Is my data safe, and do you train AI on it?",
        a: "Your data is encrypted in transit and at rest, access is role-scoped, and the app can be locked behind biometrics. We never sell your data and never use it to train any model — the AI reasons over it only when you ask, then the conversation is discarded.",
      },
      {
        q: "Where is my data stored?",
        a: "In a managed cloud with daily encrypted backups. Region options for data-residency requirements are available on the Scale plan.",
      },
      {
        q: "Can I get my data out again?",
        a: "Always, in one click. Full CSV export of every record — products, customers, orders, invoices, purchase orders and more — from Settings. You own your data; Pallio is just where you work on it.",
      },
      {
        q: "What devices does Pallio run on?",
        a: "Native apps for iPhone, Android, Mac and Windows, plus any modern browser (which you can install to your home screen). It's the same Pallio with the same data everywhere — phone on the move, laptop in the back office, the till up front.",
      },
      {
        q: "How do I get help if I'm stuck?",
        a: "Email and in-app chat on every plan, with priority queues on Growth, and phone + WhatsApp support on Scale. During business hours we typically reply in under two hours.",
      },
    ],
  },
]

export default function FaqPage() {
  React.useEffect(() => {
    document.title = "FAQ · Pallio"
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
            The honest answers to what people ask us most. If yours isn't here, our team is one tap away.
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
            We answer every email and every chat. Average response under 2 hours during business hours.
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
