import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Bot,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Globe,
  Megaphone,
  PackageCheck,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhoneFrame } from "@/components/marketing/phone-frame"
import { PhoneDashboardMock } from "@/components/marketing/phone-mock"

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 24, stiffness: 220 } },
}

export default function LandingPage() {
  React.useEffect(() => {
    document.title = "Pallio — Inventory, POS, sales and marketing in one app"
  }, [])

  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <DashboardShowcase />
      <InsightsShowcase />
      <Stats />
      <Testimonials />
      <FinalCTA />
    </>
  )
}

// ---- Hero ----
function Hero() {
  return (
    <section className="relative overflow-hidden pwa-top">
      {/* Background gradient swirls */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl dark:bg-primary/15" />
        <div className="absolute -top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-32 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
        {/* Faint dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-12 pt-12 md:px-6 md:pb-20 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        {/* Left: copy */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="flex flex-col items-start justify-center"
        >
          <motion.span
            variants={fadeIn}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand dark:border-primary/30 dark:bg-primary/10 dark:text-primary"
          >
            <Sparkles className="h-3 w-3" /> Built mobile-first · made for operators
          </motion.span>

          <motion.h1
            variants={fadeIn}
            className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl lg:text-6xl"
          >
            Run inventory, POS, sales,
            <br />
            and marketing
            <span className="bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
              {" "}in one app.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Pallio is a single, fast, mobile-first command centre for your business — stock, register, team, ads, books, and AI insights. No more juggling six tools.
          </motion.p>

          <motion.div variants={fadeIn} className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="text-base">
                Try the live demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="text-base">
                <Play className="h-4 w-4" /> See pricing
              </Button>
            </Link>
          </motion.div>

          <motion.ul
            variants={fadeIn}
            className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
          >
            {[
              "Free up to 100 SKUs",
              "No credit card",
              "Mobile + desktop + native",
              "iOS · Android · Web",
            ].map((line) => (
              <li key={line} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {line}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right: phone frame */}
        <div className="relative flex items-center justify-center">
          {/* Floating accent cards behind the phone */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 22, stiffness: 180 }}
            className="absolute left-2 top-12 hidden w-40 rounded-2xl border border-border bg-card p-3 shadow-xl md:block"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
                <p className="text-xs font-bold">+12% revenue</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, type: "spring", damping: 22, stiffness: 180 }}
            className="absolute -right-2 top-32 hidden w-44 rounded-2xl border border-border bg-card p-3 shadow-xl md:block"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pallio AI</p>
                <p className="text-xs font-bold">3 items to restock</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.7, type: "spring", damping: 22, stiffness: 180 }}
            className="absolute -bottom-4 right-10 hidden w-40 rounded-2xl border border-border bg-card p-3 shadow-xl md:block"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300">
                <Megaphone className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Marketing</p>
                <p className="text-xs font-bold">4.2× ROAS · IG</p>
              </div>
            </div>
          </motion.div>

          <PhoneFrame width={280} tilt="right">
            <PhoneDashboardMock />
          </PhoneFrame>
        </div>
      </div>
    </section>
  )
}

// ---- Trust bar ----
function TrustBar() {
  const logos = ["Acme Co", "BrightLane", "NovaApps", "Cobalt", "Glow Co", "Porcel"]
  return (
    <section className="border-y border-border/60 bg-muted/30 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Loved by operators at
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {logos.map((l) => (
            <li
              key={l}
              className="text-sm font-bold tracking-tight text-muted-foreground/80"
            >
              {l}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---- Features ----
const FEATURES: { Icon: LucideIcon; tone: string; title: string; body: string }[] = [
  {
    Icon: Boxes,
    tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    title: "Inventory that updates itself",
    body: "Multi-location stock, composite kits, expiries, transfers, and adjustments. Pallio recalculates demand + restock points as you sell.",
  },
  {
    Icon: ShoppingCart,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    title: "Point of sale that actually feels fast",
    body: "Tap-to-cart catalog, barcode scan, splits, returns, virtual accounts, drafts, multi-cashier. Works offline; syncs on reconnect.",
  },
  {
    Icon: Users,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    title: "Sales team that's actually accountable",
    body: "Live leaderboard, per-rep commissions, team chat, real-time inventory visibility, and demographic-aware performance reports.",
  },
  {
    Icon: Megaphone,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    title: "Marketing without the swivel-chair",
    body: "Facebook + Instagram + YouTube ads + Marketplace listings — connected to your live catalog. Affiliate program built in.",
  },
  {
    Icon: Bot,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    title: "AI assistant + smart insights",
    body: "Ask anything about your data in plain English. Pallio surfaces what to restock, where margin drifted, which campaign to pause.",
  },
  {
    Icon: ShieldCheck,
    tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    title: "Role-based access, biometric unlock",
    body: "Invite staff, cashiers, marketers, affiliates — each with the right scopes. Face ID / fingerprint app lock keeps your data private.",
  },
]

function Features() {
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Everything in one place
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Six tools. <span className="text-muted-foreground">One app.</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Pallio replaces the spreadsheet + standalone POS + standalone inventory + standalone email blast + standalone affiliate dashboard combination most teams cobble together.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, type: "spring", damping: 24, stiffness: 220 }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-lg"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.tone}`}>
                <f.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Dashboard showcase ----
function DashboardShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-card/40 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", damping: 24, stiffness: 200 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Your day, in one screen
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            A dashboard that knows
            <br />
            <span className="text-muted-foreground">what to ask about.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Revenue + stock + open orders + out-of-stock at the top. AI Insights highlighting what needs your eyes. Forecast for the next 7 days. Suggested restock list with one-tap PO creation. Activity feed showing what just happened.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {[
              ["Pallio noticed", "Rule-based + ML-style observations from your live data."],
              ["7-day forecast", "Revenue projection + confidence band."],
              ["Smart restock", "Suggested qty per SKU, one-tap PO."],
              ["Activity stream", "Sales / refunds / PO receipts / campaigns — live."],
            ].map(([k, v]) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <p className="text-sm">
                  <span className="font-bold">{k}.</span>{" "}
                  <span className="text-muted-foreground">{v}</span>
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <Link to="/dashboard">
              <Button size="lg">
                Open the live dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="relative flex items-center justify-center">
          <PhoneFrame width={300} tilt="left">
            <PhoneDashboardMock />
          </PhoneFrame>
        </div>
      </div>
    </section>
  )
}

// ---- AI Insights mini ----
function InsightsShowcase() {
  const cards = [
    { title: "USB‑C Hub trending +24%", body: "Reorder 60 units · ~4 days of stock left.", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300", Icon: TrendingUp },
    { title: "Cobalt 2 days late · 3 of last 4", body: "Stock buffer for sole-source items <7 days.", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300", Icon: ClipboardList },
    { title: "IG Reels ROAS hit 4.2×", body: "Holiday Tee Reel is the top performer.", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", Icon: Megaphone },
  ]
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-brand to-fuchsia-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm shadow-brand/30">
            <Sparkles className="h-3 w-3" /> AI Insights
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Pallio tells you what to look at next.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Trending SKUs, vendor lateness, margin drift, ROAS surges, low-stock crossings — surfaced as cards with one-tap actions. Stop scrolling reports.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08, type: "spring", damping: 24, stiffness: 220 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.tone}`}>
                <c.Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-primary">
                Resolve
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Stats ----
function Stats() {
  const items = [
    { value: "131+", label: "Pages of functionality" },
    { value: "13", label: "Native integrations" },
    { value: "<3s", label: "Cold-start on 4G" },
    { value: "100%", label: "Mobile-first" },
  ]
  return (
    <section className="border-y border-border/60 bg-gradient-to-br from-brand/5 via-card/40 to-emerald-500/5 px-4 py-16 md:px-6 md:py-20 dark:from-primary/10 dark:to-emerald-950/15">
      <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.06, type: "spring", damping: 24, stiffness: 220 }}
            className="text-center"
          >
            <p className="bg-gradient-to-br from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-4xl font-extrabold tabular-nums text-transparent md:text-5xl">
              {it.value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {it.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ---- Testimonials ----
function Testimonials() {
  const quotes = [
    {
      body: "We dropped four SaaS subscriptions the week we switched. Inventory + POS + reporting in one place, in our pockets.",
      author: "Mia Chen",
      title: "Floor manager · Downtown Austin",
    },
    {
      body: "The AI insights are the part I tell other operators about. It flagged a vendor running 2 days late before I'd noticed.",
      author: "Alex Larson",
      title: "Founder · BrightLane",
    },
    {
      body: "We run a 4-location pop-up business. Pallio is the first thing that has actually let me see all four stores at once.",
      author: "Priya Patel",
      title: "Ops lead · Glow Co",
    },
  ]
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          What operators are saying.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06, type: "spring", damping: 24, stiffness: 220 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <blockquote className="text-base leading-relaxed">"{q.body}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-sm font-bold text-white">
                  {q.author.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-bold">{q.author}</p>
                  <p className="text-xs text-muted-foreground">{q.title}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Final CTA ----
function FinalCTA() {
  const perks = [
    { Icon: Zap, label: "Instant setup" },
    { Icon: CreditCard, label: "Free up to 100 SKUs" },
    { Icon: Globe, label: "Web + iOS + Android" },
    { Icon: PackageCheck, label: "Cancel any time" },
  ]
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-32">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand/25 via-fuchsia-500/15 to-emerald-500/15 blur-3xl" />
      </div>
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="text-4xl font-extrabold tracking-tight md:text-5xl"
        >
          Ready to ship?
          <br />
          <span className="bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
            Free, in 30 seconds.
          </span>
        </motion.h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Spin up Pallio, kick the tires with our live demo data, and connect your own stock when you're ready.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button size="lg" className="text-base">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="text-base">
              Talk to us
            </Button>
          </Link>
        </div>
        <ul className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {perks.map((p) => (
            <li key={p.label} className="inline-flex items-center gap-1.5">
              <p.Icon className="h-3.5 w-3.5 text-brand dark:text-primary" /> {p.label}
            </li>
          ))}
        </ul>
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Tracked on the leaderboard? Pallio is the only one that listed first.</span>
        </div>
      </div>
    </section>
  )
}
