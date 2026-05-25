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
  ShoppingCart,
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

// First-run welcome modal — shown ONCE the very first time a user hits the
// dashboard after signup, and again if they choose "Replay setup tour" in
// Settings → Business. Persisted in kv so it never re-shows on its own.
//
// One linear step machine: a single `stepIdx` over a `steps` array. The
// profile question is only part of the sequence when there's no saved
// profile yet, so the progress indicator always matches the real number
// of screens — no phantom/contradicting steps.

const SEEN_KEY = "pallio:first-run-seen"

function readSeen(): boolean {
  return kv.get(SEEN_KEY) === "1"
}

export async function resetFirstRun(): Promise<void> {
  await kv.remove(SEEN_KEY)
  window.dispatchEvent(new CustomEvent("pallio:first-run-changed"))
}

type StepKey = "profile" | "welcome" | "ready"

export function FirstRunModal() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  // Whether to ask the profile question is decided once, when the modal
  // opens — not re-read mid-flow, so the step list is stable.
  const [includeProfile, setIncludeProfile] = React.useState(false)
  const steps = React.useMemo<StepKey[]>(
    () => (includeProfile ? ["profile", "welcome", "ready"] : ["welcome", "ready"]),
    [includeProfile],
  )
  const [stepIdx, setStepIdx] = React.useState(0)
  const [industry, setIndustry] = React.useState<IndustryKey | null>(null)
  const [sells, setSells] = React.useState<SellsKind>("products")

  const beginFlow = React.useCallback(() => {
    setIncludeProfile(!loadBusinessProfile())
    setStepIdx(0)
    setIndustry(null)
    setSells("products")
    setOpen(true)
  }, [])

  // Mount-time decision — open only if first-run is unseen. The reset
  // event (from Settings → "Replay setup tour") re-opens it fresh.
  React.useEffect(() => {
    if (!readSeen()) beginFlow()
    const onReset = () => { if (!readSeen()) beginFlow() }
    window.addEventListener("pallio:first-run-changed", onReset)
    return () => window.removeEventListener("pallio:first-run-changed", onReset)
  }, [beginFlow])

  const close = async () => {
    setOpen(false)
    await kv.set(SEEN_KEY, "1")
  }

  const goSetup = async () => {
    await close()
    navigate("/settings/business")
  }

  const step = steps[stepIdx]
  const next = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1))
  const back = () => setStepIdx((i) => Math.max(i - 1, 0))

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

          <div className="relative p-6 sm:p-8">
            {/* Progress — same place on every screen, counts the REAL
                number of steps (incl. the profile question when shown). */}
            <Progress total={steps.length} active={stepIdx} />

            {step === "profile" && (
              <>
                <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md shadow-brand/30">
                  <Store className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">What do you run?</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Pick the closest fit. Pallio just reorders your setup steps to match —
                  <strong className="text-foreground"> nothing is hidden</strong>, and you can change it later in Settings.
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

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Button
                    disabled={!industry}
                    onClick={() => {
                      if (!industry) return
                      saveBusinessProfile({ industry, sells })
                      next()
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={next}>Skip for now</Button>
                </div>
              </>
            )}

            {step === "welcome" && (
              <>
                <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-md shadow-brand/30">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Welcome to Pallio 👋</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  One place to run the whole business — built Naira-first for Nigerian operators. Here's what's inside:
                </p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {[
                    { Icon: ShoppingCart, label: "POS", body: "Sell in person — tap items, take card or cash, print a receipt." },
                    { Icon: Globe,        label: "Storefront", body: "A hosted online shop — pick a template, customers buy + track delivery." },
                    { Icon: CreditCard,   label: "Accounting", body: "Books keep themselves — every sale and bill posts to the right journal." },
                    { Icon: Bot,          label: "AI Assistant", body: "Ask in plain English: “which SKUs need reordering?”" },
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
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Button onClick={next} className="flex-1 sm:flex-none">
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                  {stepIdx > 0 ? (
                    <Button variant="ghost" onClick={back}>Back</Button>
                  ) : (
                    <Button variant="ghost" onClick={close}>Skip</Button>
                  )}
                </div>
              </>
            )}

            {step === "ready" && (
              <>
                <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-md">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">You're all set</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Your dashboard has a <strong className="text-foreground">Getting started checklist</strong> that walks you through setup at your own pace. The best first step:
                </p>
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                    <Store className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Set up your business</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Name, address, currency, tax registration — about 60 seconds.</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Button onClick={goSetup} className="flex-1 sm:flex-none">
                    Set up my business <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={back}>Back</Button>
                  <Button variant="ghost" onClick={close}>Explore the dashboard</Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function Progress({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-6 bg-brand dark:bg-primary" : i < active ? "w-1.5 bg-brand/50 dark:bg-primary/50" : "w-1.5 bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">
        Step {active + 1} of {total}
      </span>
    </div>
  )
}
