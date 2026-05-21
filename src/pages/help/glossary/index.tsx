import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Search } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"

// Plain-language glossary for the Pallio app. Anything a layman might
// type into Google ("what is a SKU", "what is COGS", "what does net 30
// mean") lands here with a one-paragraph answer + the relevant Pallio
// surface to act on it. InfoTooltips across the app can deep-link to
// `#term-<id>` so tapping a "Learn more →" link inside a tooltip
// jumps straight to the long-form explanation.

type Term = {
  id: string
  term: string
  aka?: string[]
  category: "Inventory" | "Sales" | "Purchasing" | "Accounting" | "Tax" | "Marketing" | "POS" | "Operations"
  body: React.ReactNode
  /** Optional "where to find this in Pallio" deep link. */
  appHref?: string
  appLabel?: string
}

const TERMS: Term[] = [
  {
    id: "sku",
    term: "SKU",
    aka: ["Stock Keeping Unit"],
    category: "Inventory",
    body: <>A short, unique code (letters + numbers, e.g. <span className="font-mono">EL-2109</span>) that identifies one specific sellable thing. Two t-shirts in different sizes are two SKUs. Pallio uses the SKU on every receipt, label, and report.</>,
    appHref: "/inventory",
    appLabel: "Inventory",
  },
  {
    id: "barcode",
    term: "Barcode",
    aka: ["UPC", "EAN"],
    category: "Inventory",
    body: <>The black-stripes label on a product. Scanning it at the till instantly identifies the SKU. <strong>UPC-A</strong> is the US standard, <strong>EAN-13</strong> is everywhere else, <strong>Code 128</strong> is for self-printed labels.</>,
    appHref: "/inventory/labels",
    appLabel: "Print labels",
  },
  {
    id: "reorder-point",
    term: "Reorder point",
    aka: ["Min stock"],
    category: "Inventory",
    body: <>The on-hand quantity that triggers a "you should reorder" warning on the dashboard. Rule of thumb: about <strong>twice what you sell in a week</strong>, so you have time to place an order before the shelves go bare.</>,
    appHref: "/reporting/stock",
    appLabel: "Stock report",
  },
  {
    id: "uom",
    term: "Unit of measure",
    aka: ["UoM"],
    category: "Inventory",
    body: <>How you sell an item — pieces, boxes, kilograms, litres, dozens. Picking the right UoM avoids confusion when your supplier sells you "1 carton of 24" but your staff rings up "1 pack."</>,
  },
  {
    id: "composite",
    term: "Composite item",
    aka: ["Bundle", "Kit"],
    category: "Inventory",
    body: <>A single SKU that's actually multiple underlying items grouped together — a gift set, meal deal, or "buy 3 get 1." When you sell the bundle, Pallio deducts every component from stock automatically.</>,
    appHref: "/inventory/composite",
    appLabel: "Composite items",
  },
  {
    id: "po",
    term: "Purchase Order",
    aka: ["PO"],
    category: "Purchasing",
    body: <>The official document you send a supplier saying "deliver these items at these prices on these terms." Tracked through its lifecycle: open → received → billed → paid.</>,
    appHref: "/purchasing/pos",
    appLabel: "Purchase orders",
  },
  {
    id: "grn",
    term: "Goods receipt",
    aka: ["GRN", "Receipt"],
    category: "Purchasing",
    body: <>The moment stock physically arrives at your warehouse. Recording it tells Pallio "this PO showed up — add the new units to my on-hand count and start the return-window clock."</>,
    appHref: "/purchasing/receipts",
    appLabel: "Goods receipts",
  },
  {
    id: "bill",
    term: "Bill",
    aka: ["Vendor invoice", "Accounts payable"],
    category: "Purchasing",
    body: <>An invoice <em>your supplier</em> sent <em>you</em> — money you owe. The mirror of an invoice (which is what you send your customers).</>,
    appHref: "/purchasing/bills",
    appLabel: "Bills",
  },
  {
    id: "vendor-credit",
    term: "Vendor credit",
    aka: ["Credit memo"],
    category: "Purchasing",
    body: <>Money your supplier owes <em>you</em> back — usually for over-billing, damaged goods, short shipments, or rebates. Pallio applies it to their next bill so you pay less, rather than waiting for an actual refund.</>,
    appHref: "/purchasing/vendor-credits",
    appLabel: "Vendor credits",
  },
  {
    id: "net-terms",
    term: "Net 7 / 14 / 30 / 60",
    aka: ["Payment terms"],
    category: "Purchasing",
    body: <>How many days a buyer has to pay after the invoice date. <strong>Net 30</strong> = pay within 30 days. Most B2B in Nigeria runs Net 30. Faster terms (Net 7) help your cash flow but may not be negotiable with bigger suppliers.</>,
  },
  {
    id: "sales-order",
    term: "Sales order",
    aka: ["SO"],
    category: "Sales",
    body: <>What you create when a customer agrees to buy — but before money or goods change hands. Pallio holds the stock so it doesn't get sold twice, then converts to an invoice + shipment when you're ready.</>,
    appHref: "/sales/orders",
    appLabel: "Sales orders",
  },
  {
    id: "invoice",
    term: "Invoice",
    aka: ["Bill (your side)", "AR"],
    category: "Sales",
    body: <>The document <em>you send a customer</em> saying "you owe me." Tracks status as unpaid → partial → paid → overdue. Different from <strong>Bills</strong> (suppliers' invoices to you).</>,
    appHref: "/sales/invoices",
    appLabel: "Invoices",
  },
  {
    id: "receipt",
    term: "Receipt",
    category: "Sales",
    body: <>Proof of payment. Pallio creates one automatically every time a customer settles an invoice or pays at the till. An invoice says "you owe"; a receipt says "you paid."</>,
    appHref: "/sales/receipts",
    appLabel: "Receipts",
  },
  {
    id: "rma",
    term: "RMA",
    aka: ["Return Merchandise Authorisation", "Return"],
    category: "Sales",
    body: <>The reference number assigned to a customer return so you can track refunds, restock decisions, and any prepaid shipping label you send them.</>,
    appHref: "/sales/returns",
    appLabel: "Returns",
  },
  {
    id: "pos",
    term: "POS",
    aka: ["Point of Sale", "Till"],
    category: "POS",
    body: <>The cash register inside Pallio. Tap items from the catalog or scan a barcode, take payment (cash / card / transfer / split), print the receipt. Every transaction updates stock + reports instantly.</>,
    appHref: "/pos",
    appLabel: "Open the till",
  },
  {
    id: "draft",
    term: "POS draft",
    aka: ["Held sale"],
    category: "POS",
    body: <>A cart parked mid-transaction — customer left to grab one more thing, queue grew, you swapped registers. Pallio remembers the items + the price so you can pick up where you stopped.</>,
    appHref: "/pos/drafts",
    appLabel: "POS drafts",
  },
  {
    id: "register-variance",
    term: "Register variance",
    category: "POS",
    body: <>Closing cash count <em>minus</em> opening float <em>minus</em> sales. Non-zero variance means the till is short or over. Common causes: mis-typed change, voided sales, theft, or banking errors.</>,
    appHref: "/reporting/register",
    appLabel: "Register report",
  },
  {
    id: "cogs",
    term: "COGS",
    aka: ["Cost of Goods Sold"],
    category: "Accounting",
    body: <>What it cost you (at the supplier price) to acquire the goods you actually sold in a period. <strong>Revenue − COGS = Gross profit.</strong></>,
    appHref: "/reporting/profit-loss",
    appLabel: "P&L",
  },
  {
    id: "gross-profit",
    term: "Gross profit",
    category: "Accounting",
    body: <>Revenue minus COGS. The money left over <em>before</em> you've paid your operating expenses (rent, salaries, marketing). The first profitability number an investor looks at.</>,
  },
  {
    id: "net-profit",
    term: "Net profit",
    aka: ["Bottom line"],
    category: "Accounting",
    body: <>Gross profit minus operating expenses. The final number — what's actually left after every cost is paid. If it's positive, the business made money this period.</>,
    appHref: "/reporting/profit-loss",
    appLabel: "P&L",
  },
  {
    id: "balance-sheet",
    term: "Balance sheet",
    category: "Accounting",
    body: <>A photo of the business's finances on one day: what you <strong>own</strong> (Assets), what you <strong>owe</strong> (Liabilities), and what's <strong>left for the owners</strong> (Equity). Always balances: <em>Assets = Liabilities + Equity</em>.</>,
    appHref: "/accounting/balance-sheet",
    appLabel: "Balance sheet",
  },
  {
    id: "ar-ap",
    term: "AR / AP",
    aka: ["Receivables", "Payables"],
    category: "Accounting",
    body: <><strong>AR</strong> (Accounts Receivable) = money customers owe you. <strong>AP</strong> (Accounts Payable) = money you owe suppliers. The bigger your AR vs AP, the more cash is "trapped" waiting to be collected.</>,
    appHref: "/reporting/supplier-customer",
    appLabel: "Supplier & customer report",
  },
  {
    id: "vat",
    term: "VAT",
    aka: ["Value Added Tax", "GST"],
    category: "Tax",
    body: <>A consumption tax added to most sales. Nigeria's standard rate is <strong>7.5%</strong> (set by FIRS). You collect it from customers and remit to the government each filing period.</>,
    appHref: "/settings/taxes",
    appLabel: "Tax rates",
  },
  {
    id: "wht",
    term: "WHT",
    aka: ["Withholding tax"],
    category: "Tax",
    body: <>A tax deducted at source on certain services + transactions (5% on most professional services in Nigeria). The buyer withholds it from the payment and remits to FIRS on the seller's behalf.</>,
  },
  {
    id: "tin",
    term: "TIN",
    aka: ["Tax Identification Number"],
    category: "Tax",
    body: <>Your business's unique tax number issued by FIRS. Required on B2B invoices so your buyer can reclaim VAT. Other countries call it EIN (US), GSTIN (India), or VAT number (UK).</>,
    appHref: "/settings/business",
    appLabel: "Business settings",
  },
  {
    id: "zero-rated",
    term: "Zero-rated",
    aka: ["VAT-exempt"],
    category: "Tax",
    body: <>Goods that legally carry 0% VAT — basic food, books, medical supplies in many jurisdictions. Different from "exempt": zero-rated items still show on VAT returns, exempt ones don't.</>,
  },
  {
    id: "roas",
    term: "ROAS",
    aka: ["Return on Ad Spend"],
    category: "Marketing",
    body: <>Revenue attributed to an ad campaign divided by what you paid for it. <strong>3×</strong> is healthy; <strong>under 1×</strong> means the campaign is losing money. Pallio computes it live from your connected ad accounts.</>,
    appHref: "/marketing",
    appLabel: "Marketing",
  },
  {
    id: "ctr",
    term: "CTR",
    aka: ["Click-Through Rate"],
    category: "Marketing",
    body: <>Of everyone who saw the ad, what % clicked. 1–3% is normal for social ads, anything &gt; 5% is excellent. Low CTR means the creative isn't catching attention — fix the image + headline before fixing the targeting.</>,
  },
  {
    id: "commission",
    term: "Commission",
    category: "Marketing",
    body: <>The cut a sales rep or affiliate earns on a sale they drove. Pallio calculates it automatically per attributed order and pays out monthly. Default is 10% in Pallio's affiliate programme.</>,
    appHref: "/marketing/commissions",
    appLabel: "Commissions",
  },
  {
    id: "wholesale",
    term: "Wholesale",
    aka: ["B2B", "Trade"],
    category: "Sales",
    body: <>Selling in bulk to other businesses at discounted prices. In Pallio, a customer tagged as "Wholesale" automatically gets the wholesale price list at checkout and longer payment terms.</>,
  },
  {
    id: "stock-transfer",
    term: "Stock transfer",
    category: "Operations",
    body: <>Moving units between your own locations (e.g. Ikeja warehouse → Lekki shop). Doesn't change your total on-hand, just where it sits.</>,
    appHref: "/inventory/transfers",
    appLabel: "Stock transfers",
  },
  {
    id: "stock-adjustment",
    term: "Stock adjustment",
    category: "Operations",
    body: <>A manual change to stock count for shrinkage, breakage, theft, or just a recount that didn't match. Always logged separately from sales + POs for audit purposes.</>,
    appHref: "/inventory/adjustments",
    appLabel: "Stock adjustments",
  },
  {
    id: "shrinkage",
    term: "Shrinkage",
    category: "Operations",
    body: <>The gap between what your records say is on the shelf and what's actually there — caused by theft, miscounts, damaged goods, or admin errors. Healthy retail shrinkage is under 2% of revenue.</>,
  },
]

const CATEGORIES = ["All", "Inventory", "Sales", "Purchasing", "POS", "Accounting", "Tax", "Marketing", "Operations"] as const
type Category = (typeof CATEGORIES)[number]

export default function Glossary() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 250)) }, []))
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<Category>("All")

  // Jump to anchor on initial mount if the URL has one (e.g. tooltip
  // "Learn more →" deep links into /help/glossary#term-rma).
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return TERMS.filter((t) => {
      if (category !== "All" && t.category !== category) return false
      if (!q) return true
      const hay = [t.term, ...(t.aka ?? []), t.category].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [query, category])

  return (
    <PageShell
      title="Glossary"
      withToolbar={false}
      titleTooltip={
        <>
          A plain-language dictionary of every term you'll see in
          Pallio — from SKU and COGS to ROAS and WHT. Tap any tooltip's
          "Learn more →" anywhere in the app to land on the term's
          full explanation.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-brand/25 via-fuchsia-500/15 to-transparent blur-3xl" aria-hidden />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Glossary</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Every term Pallio uses, explained in one paragraph. If you've ever wondered "what is a goods receipt?" or "what's the difference between an invoice and a bill?", you're in the right place.
              </p>
            </div>
          </div>
        </section>

        {/* Filter strip + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  c === category
                    ? "shrink-0 rounded-full border border-transparent bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                    : "shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative min-w-[220px] sm:ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Term list */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No matches for "<span className="font-medium text-foreground">{query}</span>".
              {" "}
              <button type="button" onClick={() => { setQuery(""); setCategory("All") }} className="font-semibold text-brand hover:underline dark:text-primary">
                Clear filters
              </button>
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((t) => (
              <li key={t.id}>
                <article
                  id={`term-${t.id}`}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40"
                >
                  <header className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold tracking-tight">{t.term}</h3>
                      {t.aka && t.aka.length > 0 && (
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          aka {t.aka.join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand dark:bg-primary/15 dark:text-primary">
                      {t.category}
                    </span>
                  </header>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  {t.appHref && (
                    <Link
                      to={t.appHref}
                      className="mt-auto inline-flex w-fit items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline dark:text-primary"
                    >
                      {t.appLabel ?? "Open in Pallio"}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p>
            Can't find a term?{" "}
            <Link to="/contact" className="font-semibold text-brand hover:underline dark:text-primary">
              Tell us what's missing
            </Link>{" "}
            — we add new entries every fortnight. You can also ask <Link to="/ai" className="font-semibold text-brand hover:underline dark:text-primary">Pallio AI</Link> directly.
          </p>
        </div>

        {/* "Back to top" CTA when the list is long */}
        {filtered.length > 8 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("main")?.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to top
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
