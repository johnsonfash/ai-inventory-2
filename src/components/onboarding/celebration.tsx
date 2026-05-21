import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Globe, Megaphone, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kv } from "@/lib/storage/kv"
import { cn } from "@/lib/utils"

// Celebration modal — fires once when the onboarding checklist hits
// 12/12. Confetti + "you're all set" + a tiny week-1 playbook.
//
// State stored under `pallio:onboarding-celebrated`. Independent of
// the main progress map so it survives reset-tour without re-firing.

const SEEN_KEY = "pallio:onboarding-celebrated"

export function CelebrationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Guard — even if parent miscalls, don't show twice.
  React.useEffect(() => {
    if (open) void kv.set(SEEN_KEY, "1")
  }, [open])

  if (!open || typeof document === "undefined") return null

  // 24 confetti pieces — colour + delay + horizontal drift varied
  // deterministically per index.
  const confetti = Array.from({ length: 24 }, (_, i) => ({
    color: ["#7c3aed", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#f43f5e"][i % 6]!,
    delay: (i * 0.06) % 1.4,
    drift: ((i % 5) - 2) * 30,
    rotate: (i * 47) % 360,
  }))

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 backdrop-blur-sm p-3 sm:items-center"
        role="alertdialog"
        aria-modal="true"
        aria-label="You're all set"
        onClick={onClose}
      >
        {/* Confetti pieces — fixed positioning so they cascade from
            the top of the viewport. Disabled in reduced-motion mode. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
          {confetti.map((c, i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: -20, opacity: 0, rotate: 0 }}
              animate={{
                x: c.drift,
                y: 800,
                opacity: [0, 1, 1, 0],
                rotate: c.rotate,
              }}
              transition={{ duration: 2.6, delay: c.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
              style={{
                position: "absolute",
                left: `${(i * 79) % 100}%`,
                background: c.color,
                width: 10,
                height: 14,
                borderRadius: 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400/40 via-brand/30 to-transparent blur-3xl" aria-hidden />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative p-6 text-center sm:p-8">
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 240, delay: 0.1 }}
              className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-brand to-fuchsia-500 text-white shadow-lg shadow-brand/40"
            >
              <Sparkles className="h-8 w-8" />
            </motion.span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">You're all set 🎉</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every onboarding step is done. Pallio is fully wired up — POS, storefront, accounting, marketing, all flowing into each other.
            </p>

            {/* Week-1 playbook */}
            <div className="mt-6 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Week-1 playbook</p>
              <ul className="mt-2 space-y-2">
                {[
                  { Icon: Globe,     label: "Share your storefront link", body: "DM customers + post on IG / WhatsApp Stories.", href: "/storefront" },
                  { Icon: Megaphone, label: "Run a small ad",             body: "₦5k Facebook test campaign. Measure ROAS in 5 days.", href: "/marketing" },
                  { Icon: Sparkles,  label: "Ask Pallio AI a question",   body: "Try 'what should I restock this week?'.", href: "/ai" },
                ].map((p) => (
                  <li key={p.label}>
                    <Link
                      to={p.href}
                      onClick={onClose}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-brand/40 hover:bg-accent/30"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                        <p.Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{p.label}</p>
                        <p className="text-[11px] text-muted-foreground">{p.body}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="mt-6 w-full" onClick={onClose}>
              Back to dashboard
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

export function hasCelebrated(): boolean {
  return kv.get(SEEN_KEY) === "1"
}

export async function resetCelebration(): Promise<void> {
  await kv.remove(SEEN_KEY)
}
