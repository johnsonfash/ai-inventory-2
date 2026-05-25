import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Bot,
  Check,
  CreditCard,
  Globe,
  PackagePlus,
  Sparkles,
  Store,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { kv } from "@/lib/storage/kv"
import {
  INDUSTRIES,
  loadBusinessProfile,
  saveBusinessProfile,
  type IndustryKey,
  type SellsKind,
} from "@/lib/profile/business-profile"
import { cn } from "@/lib/utils"

// First-run welcome modal — shown ONCE the very first time a user
// hits the dashboard after signup. Three-screen mini-tour with skip.
// Persisted in kv so it never shows again after dismiss/finish.

const SEEN_KEY = "pallio:first-run-seen"

function readSeen(): boolean {
  return kv.get(SEEN_KEY) === "1"
}

export async function resetFirstRun(): Promise<void> {
  await kv.remove(SEEN_KEY)
  window.dispatchEvent(new CustomEvent("pallio:first-run-changed"))
}

type Screen = 0 | 1 | 2

export function FirstRunModal() {
  const [open, setOpen] = React.useState(false)
  const [screen, setScreen] = React.useState<Screen>(0)
  // App Wave 3: ask the one business-profile question first, unless the
  // user already has a profile.
  const [showProfile, setShowProfile] = React.useState(() => !loadBusinessProfile())
  const [industry, setIndustry] = React.useState<IndustryKey | null>(null)
  const [sells, setSells] = React.useState<SellsKind>("products")
  const navigate = useNavigate()

  // Mount-time decision — open only if first-run is unseen.
  React.useEffect(() => {
    if (!readSeen()) setOpen(true)
    const onReset = () => { if (!readSeen()) setOpen(true) }
    window.addEventListener("pallio:first-run-changed", onReset)
    return () => window.removeEventListener("pallio:first-run-changed", onReset)
  }, [])

  const close = async () => {
    setOpen(false)
    await kv.set(SEEN_KEY, "1")
  }

  const goSetup = async () => {
    await close()
    navigate("/settings/business")
  }

  if (!open) return null
  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="first-run"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/60 px-3 pb-24 pt-6 backdrop-blur-sm sm:pb-3 sm:pt-3"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Pallio"
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Brand glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand/40 via-fuchsia-500/25 to-transparent blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-500/30 via-brand/20 to-transparent blur-3xl" aria-hidden />

          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Screen −1 — business profile (App Wave 3) */}
          {showProfile && (
            <div className="relative p-6 sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md shadow-brand/30">
                <Store className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">What do you run?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pick the closest fit. Pallio just reorders your setup steps to match —
                <strong className="text-foreground"> nothing is hidden</strong>, and you can change it later.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {INDUSTRIES.map((ind) => {
                  const sel = industry === ind.key
                  return (
                    <button
                      key={ind.key}
                      type="button"
                      onClick={() => setIndustry(ind.key)}
                      className={cn(
                        "flex flex-col rounded-xl border-2 p-3 text-left transition-colors",
                        sel ? "border-brand bg-brand-soft dark:border-primary dark:bg-primary/15" : "border-border bg-background hover:bg-accent",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{ind.label}</span>
                        {sel && <Check className="h-4 w-4 text-brand dark:text-primary" />}
                      </span>
                      <span className="mt-0.5 text-[11px] text-muted-foreground">{ind.blurb}</span>
                    </button>
                  )
                })}
              </div>

              <p className="mt-4 text-xs font-medium text-muted-foreground">You mostly sell…</p>
              <div className="mt-2 inline-flex rounded-lg border border-input p-0.5">
                {(["products", "services", "both"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setSells(k)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                      sells === k ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  disabled={!industry}
                  onClick={() => {
                    if (!industry) return
                    saveBusinessProfile({ industry, sells })
                    setShowProfile(false)
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setShowProfile(false)}>Skip</Button>
              </div>
            </div>
          )}

          {/* Screen 0 — welcome */}
          {!showProfile && screen === 0 && (
            <div className="relative p-6 sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md shadow-brand/30">
                <Sparkles className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Welcome to Pallio 👋</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Inventory + POS + storefront + accounting in one place. Let's spend <strong className="text-foreground">two minutes</strong> setting up your business — you can skip and come back any time.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  { Icon: Store,        label: "Set up your business",     body: "Name, address, currency." },
                  { Icon: PackagePlus,  label: "Add your first item",      body: "So you can ring up your first sale." },
                  { Icon: CreditCard,   label: "Connect a payment processor", body: "Paystack, Flutterwave, Opay…" },
                  { Icon: Globe,        label: "Launch your online shop",   body: "Pick a template, point a domain." },
                ].map((s) => (
                  <li key={s.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                      <s.Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => setScreen(1)} className="flex-1 sm:flex-none">
                  Start setup <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={close}>I'll explore on my own</Button>
              </div>
              <Dots active={0} />
            </div>
          )}

          {/* Screen 1 — what's inside */}
          {screen === 1 && (
            <div className="relative p-6 sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-brand text-white shadow-md">
                <Bot className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">A few things to know</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Pallio is built for Nigerian operators — Naira-first, FIRS-compliant, NIBSS-routed payouts. Here's where the important stuff lives.
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  { kbd: "POS",          body: "Sell in-person. Tap items into cart, take card or cash, print receipt." },
                  { kbd: "Storefront",   body: "Your hosted online shop — pick a template, customers buy + track delivery." },
                  { kbd: "Accounting",   body: "Books are automatic — every sale + bill posts to the right journal." },
                  { kbd: "AI Assistant", body: "Ask plain-English questions like 'which SKUs need reordering?'." },
                ].map((t) => (
                  <li key={t.kbd} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand dark:bg-primary/15 dark:text-primary">{t.kbd}</span>
                    <p className="text-xs text-muted-foreground">{t.body}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={() => setScreen(2)} className="flex-1 sm:flex-none">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setScreen(0)}>Back</Button>
              </div>
              <Dots active={1} />
            </div>
          )}

          {/* Screen 2 — let's go */}
          {screen === 2 && (
            <div className="relative p-6 sm:p-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Ready when you are</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                The dashboard has a <strong className="text-foreground">Getting started checklist</strong> with 12 quick steps — finish them at your pace. Need a hand? Tap the info icon next to any heading for a plain-English explainer.
              </p>
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First-step suggestion</p>
                <p className="mt-1 text-sm font-semibold">Set up your business</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Name, address, currency, tax registration. Takes 60 seconds.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={goSetup} className="flex-1 sm:flex-none">
                  Set up business <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={close}>Done · take me to the dashboard</Button>
              </div>
              <Dots active={2} />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function Dots({ active }: { active: number }) {
  return (
    <div className="mt-5 flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active ? "w-6 bg-brand dark:bg-primary" : "w-1.5 bg-muted",
          )}
        />
      ))}
    </div>
  )
}
