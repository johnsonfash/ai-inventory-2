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
    title: "Mobile-first, always",
    body: "Most operators run the floor with one hand on their phone. So that's the surface we design for — desktop is a nice-to-have, not the default.",
  },
  {
    Icon: ShieldCheck,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    title: "Boring on security",
    body: "Bank-grade encryption, biometric unlock, role-scoped access, audit-friendly logs. Your data is yours — we don't sell it, train on it, or peek at it.",
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
    body: "Not a chat that hallucinates inventory. Pallio surfaces concrete decisions — restock this, audit that vendor, pause this campaign — with the data behind them visible.",
  },
]

const TIMELINE = [
  { year: "2024", title: "First commit", body: "Pallio starts as a v0-scaffolded prototype for one operator's beauty + electronics business." },
  { year: "2025", title: "131 pages, 14 waves", body: "Rebuilt mobile-first from the ground up. Real POS, real inventory, real reports — all with dummy data so anyone can kick the tires." },
  { year: "2026", title: "Native shells + AI insights", body: "PWA + iOS + Android via Capacitor, plus rule-based AI that surfaces the next decision to make." },
  { year: "Next", title: "Affiliates, multi-currency, AR scan", body: "Affiliate program with payouts, multi-currency, barcode scan with on-device ML." },
]

export default function AboutPage() {
  React.useEffect(() => {
    document.title = "About — Pallio"
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
            Pallio is a single command centre for operators — inventory, POS, sales team, marketing, books — replacing the six-tool stack most teams cobble together by year two.
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
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Born on the floor.</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, type: "spring", damping: 24, stiffness: 220 }}
            className="space-y-4 text-base leading-relaxed text-muted-foreground"
          >
            <p>
              Pallio started as a side project for a single operator running a small electronics + beauty business across three pop-up locations. The spreadsheet was breaking. The POS app didn't talk to inventory. The Facebook Ads dashboard demanded constant tab-switching.
            </p>
            <p>
              The first version was a v0-scaffolded prototype. The second version was a complete rewrite — mobile-first, dark-mode-first, opinionated about speed. Today Pallio is a 131-page, 14-wave-refactored app that handles inventory, POS, sales team, purchasing, accounting, marketing, and an AI assistant — all from a phone.
            </p>
            <p>
              The bet: operators don't want more features. They want the right feature surfaced at the right time, on the screen they actually carry around.
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
              <h3 className="mt-1 text-2xl font-bold tracking-tight">Want to help us build it?</h3>
              <p className="mt-2 max-w-prose text-muted-foreground">
                We're a tiny team obsessed with mobile-first ops software. If that sounds like home, drop us a line.
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
