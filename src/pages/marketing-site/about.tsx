import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Compass,
  Globe,
  HandHeart,
  Hash,
  Heart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const VALUES: { Icon: LucideIcon; tone: string; title: string; body: string }[] = [
  {
    Icon: Smartphone,
    tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    title: "The phone is the desk",
    body: "Most shop owners run the day with one hand on their phone. So that's the screen we design for first. Your laptop and the till at the front of the shop come along for the ride.",
  },
  {
    Icon: ShieldCheck,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    title: "Boring on security",
    body: "Bank-grade encryption, biometric unlock, role-scoped access, audit-friendly logs. Your data is yours. We don't sell it, train on it, or peek at it.",
  },
  {
    Icon: HandHeart,
    tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    title: "Honest pricing",
    body: "Three plans, no per-transaction fees, no surprise add-ons in the small print. If we ship something new that costs us money, we tell you up front.",
  },
  {
    Icon: Sparkles,
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    title: "AI that's actually useful",
    body: "Not a chat that makes up inventory numbers. Pallio surfaces concrete decisions (restock this, audit that vendor, pause this campaign) with the data behind them right there to check.",
  },
]

const TIMELINE = [
  { year: "Years before", title: "The same complaint, over and over",        body: "We'd spent years building business software. Inventory tools, point-of-sale apps, sales dashboards. Every operator we talked to said the same thing: they were paying for five apps that wouldn't talk to each other." },
  { year: "2024",         title: "Started Pallio",                            body: "Built the first version for one operator's beauty and electronics shop in Lagos. Inventory, POS, books, all in one place. They stopped copying numbers between tabs in week two." },
  { year: "2025",         title: "Rewrote it for real",                       body: "Rebuilt from scratch with everything we'd learned. Phone-first design. AI that nudges instead of chats. Integrations with the tools Nigerian SMBs actually use." },
  { year: "2026",         title: "Apps for iPhone, Android, Mac, Windows",    body: "Same Pallio, on every device you already own. Install from the App Store, Play Store, or just open it in your browser. Works when the network drops." },
  { year: "What's next",  title: "Affiliates, multi-currency, on-device scan", body: "Affiliate program with payouts, multi-currency for cross-border sellers, and barcode scanning that runs on your phone (no extra hardware)." },
]

export default function AboutPage() {
  React.useEffect(() => {
    document.title = "About · Pallio"
  }, [])
  return (
    <div className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 220 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
            About Pallio
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
            Built for the people
            <br />
            <span className="bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
              who actually run the floor.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            One app that runs the whole shop. Inventory, POS, sales team, marketing, books and AI in one place. So you can stop paying for five tools that don't talk to each other.
          </p>
        </motion.div>

        {/* Story */}
        <section id="story" className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
              The story
            </p>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why we built Pallio.</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, type: "spring", damping: 24, stiffness: 220 }}
            className="space-y-4 text-base leading-relaxed text-muted-foreground"
          >
            <p>
              We've spent years building software for businesses. Inventory systems, point-of-sale apps, sales dashboards. Each one solved a piece of the puzzle, and each one made the puzzle harder.
            </p>
            <p>
              The same operators kept telling us the same thing. They were paying for five apps that wouldn't talk to each other. They were copying numbers between tabs. The cashier was on one tool, the accountant on another, the marketing person on a third nobody else had ever seen. They didn't want better features. They wanted one app that just did the lot.
            </p>
            <p>
              Pallio is that app. Inventory, POS, sales team, marketing, books and an AI that nudges you when something needs attention. Built so the same numbers show up in the same place no matter who you are or what you're trying to do.
            </p>
            <p>
              One login. One subscription you can afford. One thing to learn. That's it.
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">What we care about.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.05, type: "spring", damping: 24, stiffness: 220 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${v.tone}`}>
                  <v.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Where we've been.</h2>
          <ol className="relative mt-8 border-l border-border pl-6">
            {TIMELINE.map((t, i) => (
              <motion.li
                key={t.year + t.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.06, type: "spring", damping: 24, stiffness: 220 }}
                className="mb-8 last:mb-0"
              >
                <span className="absolute -left-[7px] flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-brand to-fuchsia-500 shadow-md shadow-brand/40" aria-hidden="true" />
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.year}
                </p>
                <h3 className="mt-1 text-base font-bold tracking-tight">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Careers */}
        <section id="careers" className="mt-20 rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-8 dark:from-primary/10 dark:to-emerald-950/15">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand dark:text-primary">
                <Compass className="h-3.5 w-3.5" /> Careers
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight">Want to help build it?</h3>
              <p className="mt-2 max-w-prose text-muted-foreground">
                We're a small team that cares about software business owners actually want to open. If that sounds like your kind of work, drop us a line.
              </p>
            </div>
            <Link to="/contact">
              <Button size="lg">
                Get in touch
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick links */}
        <section className="mt-12 grid gap-4 text-sm sm:grid-cols-3">
          <Link to="/pricing" className="rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-brand/40">
            <p className="flex items-center gap-2 font-bold"><Globe className="h-4 w-4 text-brand dark:text-primary" /> Pricing</p>
            <p className="mt-1 text-xs text-muted-foreground">Three plans, transparent prices.</p>
          </Link>
          <Link to="/faq" className="rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-brand/40">
            <p className="flex items-center gap-2 font-bold"><Hash className="h-4 w-4 text-brand dark:text-primary" /> FAQ</p>
            <p className="mt-1 text-xs text-muted-foreground">Every question we get, answered.</p>
          </Link>
          <Link to="/contact" className="rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-brand/40">
            <p className="flex items-center gap-2 font-bold"><Heart className="h-4 w-4 text-brand dark:text-primary" /> Contact</p>
            <p className="mt-1 text-xs text-muted-foreground">Talk to humans, not bots.</p>
          </Link>
        </section>
      </div>
    </div>
  )
}
