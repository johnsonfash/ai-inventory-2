import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Bot,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Globe,
  Megaphone,
  PackageCheck,
  PackagePlus,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PhoneFrame } from "@/components/marketing/phone-frame"
import { PhoneDashboardMock } from "@/components/marketing/phone-mock"
import { LaptopFrame } from "@/components/marketing/laptop-frame"
import { DesktopDashboardMock } from "@/components/marketing/laptop-mock"

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 24, stiffness: 220 } },
}

export default function LandingPage() {
  React.useEffect(() => {
    document.title = "Pallio · Inventory, POS, sales and marketing in one app"
  }, [])

  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <DeviceShowcase />
      <DashboardShowcase />
      <InsightsShowcase />
      <Integrations />
      <Stats />
      <Testimonials />
      <FaqTeaser />
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
            <Sparkles className="h-3 w-3" /> Run the whole business from your pocket
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
            Sell, track stock, run ads, pay the team and close the books — without bouncing between six apps that never quite agree on the numbers.
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
              "Free for 30 days",
              "No credit card",
              "Works on phone, laptop, tablet",
              "iPhone · Android · Web",
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
  // Pre-launch we have no signed customers, so we don't fake a logo
  // wall of real companies — that's a false-endorsement risk and it
  // misleads visitors. Instead this row shows the RANGE of businesses
  // one Pallio account runs, which doubles as proof of the industry-
  // agnostic positioning. Swap to a real customer-logo row once we
  // have named, consenting customers.
  const sectors = [
    "Fashion & apparel",
    "Restaurants & cafés",
    "Pharmacies",
    "Electronics",
    "Salons & spas",
    "Supermarkets",
    "Auto parts",
    "Makers & manufacturing",
  ]
  return (
    <section className="border-y border-border/60 bg-muted/30 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:gap-8 md:px-6">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          From a single stall to a multi-store chain
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
          {sectors.map((s) => (
            <li
              key={s}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground/90"
            >
              {s}
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
    body: "Tap-to-cart catalog, barcode scan, splits, returns, virtual accounts, drafts, multi-cashier. Keeps selling when the power cuts; syncs when you're back.",
  },
  {
    Icon: Users,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    title: "Sales team that's actually accountable",
    body: "Live leaderboard, per-rep commissions, team chat, real-time inventory visibility, and clear performance reports.",
  },
  {
    Icon: Megaphone,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    title: "Marketing without the swivel-chair",
    body: "Facebook, Instagram, YouTube ads and Marketplace listings, all connected to your live catalog. Affiliate program built in.",
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
    body: "Invite staff, cashiers, marketers and affiliates, each with the right access. Face ID and fingerprint unlock keep your data private.",
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
            Pallio replaces the spreadsheet, the separate POS, the separate inventory tool, the email blaster and the affiliate dashboard most teams cobble together. One login. One bill.
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
              ["Activity stream", "Sales, refunds, PO receipts and campaigns, live as they happen."],
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
          <LaptopFrame width={520}>
            <DesktopDashboardMock />
          </LaptopFrame>
        </div>
      </div>
    </section>
  )
}

// ---- Device showcase ----
// "Works on every device" — phone + laptop in one composition, plus
// three small "where it runs" pills that summarise iOS / Android /
// Web. Sits between Features and DashboardShowcase so the user has
// a moment to digest the product surface before being pulled deeper.
function DeviceShowcase() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand/15 via-fuchsia-500/10 to-emerald-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Phone · Tablet · Laptop · Till
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Same Pallio.
            <br />
            <span className="text-muted-foreground">Every device you own.</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Ring up a sale on the till, check stock from your phone out on the floor, close the books on your laptop at night — same Pallio, same numbers, across every location. Lose signal and it keeps selling, then catches up the second you're back online.
          </p>
        </motion.div>

        {/* The composition: laptop tucked behind, phone floats in front + right. */}
        <div className="relative mt-12 flex flex-col items-center gap-12 md:mt-16 md:flex-row md:items-center md:justify-center md:gap-0">
          {/* Laptop — anchor */}
          <LaptopFrame width={620} className="md:mr-[-9rem] md:translate-y-2 lg:mr-[-12rem]">
            <DesktopDashboardMock />
          </LaptopFrame>

          {/* Phone — overlaps the laptop on the right, tilted forward. */}
          <PhoneFrame width={210} tilt="right" className="md:translate-y-8">
            <PhoneDashboardMock />
          </PhoneFrame>
        </div>

        {/* "Where it runs" pills — desktop shows the full descriptor,
            mobile keeps it to the platform name only so the row
            doesn't wrap into a vertical letter+text stack. */}
        <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 md:mt-16">
          {[
            { label: "iOS",     body: "From the App Store · Face ID · Push alerts" },
            { label: "Android", body: "From Play Store · Fingerprint unlock" },
            { label: "Web",     body: "Open in any browser · Save to home screen" },
            { label: "iPad",    body: "Same Pallio · Side-by-side layout" },
          ].map((p) => (
            <li
              key={p.label}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs"
            >
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 text-[10px] font-bold text-white">
                {p.label[0]}
              </span>
              <span className="font-semibold">{p.label}</span>
              <span className="hidden text-muted-foreground sm:inline">·</span>
              <span className="hidden text-muted-foreground sm:inline">{p.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---- AI Insights mini ----
function InsightsShowcase() {
  const cards = [
    { title: "Bluetooth earbuds are selling 24% faster", body: "About 4 days of stock left — reorder 60 now so you don't run out.", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300", Icon: TrendingUp },
    { title: "Your main supplier is running late again", body: "2 days late on 3 of the last 4 orders. Add a buffer or line up a backup.", tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300", Icon: ClipboardList },
    { title: "Your Instagram ad is your best one yet", body: "4.2× return on spend — well ahead of the rest. Worth more budget.", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", Icon: Megaphone },
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
            Trending SKUs, vendor lateness, margin drift, ROAS surges, low-stock crossings. Surfaced as cards with one-tap actions. Stop scrolling reports.
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
    { value: "6-in-1", label: "Tools, one login" },
    { value: "20+", label: "Integrations ready to connect" },
    { value: "<3s", label: "Opens on 4G" },
    { value: "100%", label: "Keeps selling offline" },
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
      body: "Pallio replaced four subscriptions in the first week. Inventory, POS, accounting, and the spreadsheet I used for stock counts. Whole shop runs from my phone now.",
      author: "Funke Adesanya",
      title: "Owner · Lekki Threads",
    },
    {
      body: "The AI flagged a vendor running 2 days late before I'd noticed. That alone has saved us two stock-outs this month.",
      author: "Tunde Bello",
      title: "Founder · Bukka Republic, Surulere",
    },
    {
      body: "I run three shops across Lagos and one in Abuja. Pallio is the first tool that's actually let me see all four locations on one screen.",
      author: "Chiamaka Okeke",
      title: "Operations Lead · Yaba Gadgets",
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
    { Icon: Zap, label: "Set up in minutes" },
    { Icon: CreditCard, label: "30 days free, no card" },
    { Icon: Globe, label: "Web, iPhone, Android" },
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
          <span>Your data stays yours — we never sell it or train on it.</span>
        </div>
      </div>
    </section>
  )
}

// ---- How it works ----
// Four-step "0 → 1" walkthrough aimed at first-time visitors.
function HowItWorks() {
  const STEPS: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: Sparkles,    title: "Sign up. Free for 30 days.",      body: "Create your Pallio account in 30 seconds. No card. Full Scale-tier access for the first month." },
    { Icon: PackagePlus, title: "Add your items and locations",    body: "Import your catalog from a CSV or add it by hand. Pallio's Getting Started checklist walks you through the rest." },
    { Icon: ShoppingCart,title: "Start selling, online and in-store", body: "Open the POS for the floor, invoice your wholesale customers, list on Marketplace and Instagram. All from one app." },
    { Icon: TrendingUp,  title: "Watch the AI nudge you",          body: "Pallio surfaces what to restock, where margin slipped, which campaign to pause. Your evenings come back." },
  ]
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
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            From signup to <span className="text-muted-foreground">first sale</span> in under an hour.
          </h2>
        </motion.div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06, type: "spring", damping: 24, stiffness: 220 }}
              className="relative rounded-2xl border border-border bg-card p-5"
            >
              <span className="absolute -top-3 left-5 inline-flex h-6 items-center gap-1 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-brand/40">
                Step {i + 1}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                <s.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ---- Integrations strip ----
// Three columns of integrations — Payments / Storefronts / Comms.
// Heavily weighted toward the Nigerian SMB stack (Paystack +
// Flutterwave + Opay + PalmPay) but with international rails so
// growing across borders doesn't mean migrating.
function Integrations() {
  const PAYMENTS = ["Paystack", "Flutterwave", "Opay", "PalmPay", "Stripe", "Apple Pay", "Google Pay", "Bank transfer"]
  const COMMERCE = ["Shopify", "WooCommerce", "Facebook Shop", "Instagram Shop", "TikTok Shop", "WhatsApp Business", "Custom REST API"]
  const COMMS    = ["Twilio SMS", "Mailgun", "Postmark", "WhatsApp Cloud", "Slack", "Discord"]

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-card/40 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            Built for Nigerian SMBs, ready for the world
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Connects to the things <span className="text-muted-foreground">you already use.</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Naira-first pricing and built-in support for the payment, marketplace and messaging tools Nigerian businesses actually run on. International options included so when you sell into Ghana or Kenya, you don't have to switch apps.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <LogoColumn title="Payments" items={PAYMENTS} accent="bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary" />
          <LogoColumn title="Storefronts + commerce" items={COMMERCE} accent="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
          <LogoColumn title="Communications" items={COMMS} accent="bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300" />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Don't see your stack? <Link to="/contact" className="font-semibold text-brand hover:underline dark:text-primary">Ask us</Link>. We ship a new integration every other week.
        </p>
      </div>
    </section>
  )
}

function LogoColumn({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">{title}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((it) => (
          <li
            key={it}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold"
          >
            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${accent}`}>
              {it[0]}
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---- FAQ teaser ----
function FaqTeaser() {
  const ITEMS = [
    { q: "Is it really free to start?", a: "Yes — 30 days with full access, no card and no credit check. You only enter card details if you choose a plan at the end of the trial." },
    { q: "Does Pallio take a cut of my sales?", a: "Never. You pay one flat monthly price, plus whatever your payment processor (Paystack, Flutterwave, Stripe…) charges. Pallio adds nothing on top of your sales." },
    { q: "Will it keep working if the power or network drops?", a: "Yes. The POS keeps ringing up sales offline and syncs everything the moment you're back online — built for real Nigerian trading conditions." },
    { q: "Can I move over my products and customers?", a: "Yes. Import items, customers and vendors from a CSV with a guided mapper, or one-click sync from Shopify and WooCommerce." },
  ]
  const [open, setOpen] = React.useState<number | null>(0)
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Common questions, <span className="text-muted-foreground">straight answers.</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              The biggest 4. Read the long version, or reach us on WhatsApp.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/faq"><Button variant="outline" size="sm">Full FAQ</Button></Link>
              <Link to="/contact"><Button size="sm">Talk to us</Button></Link>
            </div>
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {ITEMS.map((it, i) => {
              const isOpen = open === i
              return (
                <li key={it.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <span className="text-sm font-semibold md:text-base">{it.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

// Keep Store icon import alive — used by future merchant-mode badges.
const _UnusedStore = Store
void _UnusedStore
