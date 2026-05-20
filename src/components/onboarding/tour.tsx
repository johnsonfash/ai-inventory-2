import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { kv } from "@/lib/storage/kv"
import { cn } from "@/lib/utils"

// A single tour stop. Anchored to a `data-tour="key"` element when
// `anchorKey` is provided, otherwise centred over the viewport. The
// `navigateTo` field lets a step move the user to another route
// before highlighting — used to show off /pos, /ai, /sales/team
// during the same flow.
export type TourStep = {
  key: string
  /** data-tour attribute value to spotlight. Omit for a centred dialog. */
  anchorKey?: string
  title: string
  body: string
  /** Route to navigate to BEFORE showing this step. */
  navigateTo?: string
  /** Optional CTA label override. Default is "Next" / "Finish". */
  nextLabel?: string
}

// The actual Pallio onboarding script — the user explicitly asked
// for a Pallio-flavoured "jax-style" walk-through. Edit this array
// to add / remove / reorder steps.
const STEPS: TourStep[] = [
  {
    key: "welcome",
    title: "Welcome to Pallio",
    body: "Your inventory, POS, sales team, marketing and books — in one place. This quick tour shows you the most useful surfaces. Tap Skip any time.",
  },
  {
    key: "hero",
    anchorKey: "hero",
    navigateTo: "/",
    title: "Today, at a glance",
    body: "Your day starts here: live revenue, the month-to-date number, and how things compare to yesterday. The card refreshes itself — pull down on mobile to force a refresh.",
  },
  {
    key: "insights",
    anchorKey: "insights",
    title: "Pallio noticed",
    body: "These are AI-style observations — low-stock items with sales velocity, anomaly flags, vendor lateness, ROAS spikes. Each card has a one-tap action to address what it found.",
  },
  {
    key: "kpis",
    anchorKey: "kpis",
    title: "Your KPIs",
    body: "Revenue, stock, open orders, out-of-stock — with a tiny sparkline so you see direction at a glance. Swipe sideways on mobile to see all four.",
  },
  {
    key: "forecast",
    anchorKey: "forecast",
    title: "Forecast + restock",
    body: "The next 7 days predicted from your trend, alongside Pallio's restock suggestions. Tap Create PO to draft a purchase order pre-filled with everything that needs reordering.",
  },
  {
    key: "ops",
    anchorKey: "ops",
    title: "Things that need attention",
    body: "Low stock, open purchase orders, recent sales — the operational stuff. If anything's red here, it's worth a tap.",
  },
  {
    key: "pos",
    navigateTo: "/pos",
    title: "Point of Sale",
    body: "Run sales here. Scan a barcode, tap items, accept any payment method — Pallio prints the receipt and updates stock in real time. Drafts let you hold a sale, transactions show the day's tape.",
  },
  {
    key: "team",
    navigateTo: "/sales/team",
    title: "Sales team",
    body: "Track each rep's revenue, commissions, and ranking. The leaderboard shows the live podium; click any rep to see their pipeline. Team chat keeps everyone aligned on stock or VIP customers in real time.",
  },
  {
    key: "ai",
    navigateTo: "/ai",
    title: "AI Assistant",
    body: "Ask anything about your data in plain English — \"How much did Mia sell last week?\", \"Which SKUs need reordering?\". The assistant has full read access to whatever scope you set on the right rail.",
  },
  {
    key: "settings",
    navigateTo: "/settings",
    title: "Set yourself up",
    body: "Everything you'd expect — users + roles, warehouses, tax rates, invoice numbering, integrations (Stripe, PayPal, Shopify…), security (biometric unlock), barcode + printer config. Set it once.",
    nextLabel: "Finish tour",
  },
]

const STORAGE_KEY = "pallio:tour-complete"

// Has the user completed (or dismissed) the tour at least once?
export function isTourComplete(): boolean {
  return kv.get(STORAGE_KEY) === "1"
}

// Mark the tour complete. Called from finish / skip / explicit "Don't show again".
export async function markTourComplete(): Promise<void> {
  await kv.set(STORAGE_KEY, "1")
}

// Reset (used by Settings → "Replay tour").
export async function resetTour(): Promise<void> {
  await kv.remove(STORAGE_KEY)
}

// Open the tour programmatically. Listened to in the <Tour /> below.
const TOUR_OPEN_EVENT = "pallio:tour-open"
export function openTour(): void {
  window.dispatchEvent(new CustomEvent(TOUR_OPEN_EVENT))
}

// Auto-launch on first paint if the user hasn't completed the tour
// yet. Returns null — it's just a side-effect host. Mount once in
// App.tsx, alongside the other bootstrap components.
export function TourAutoLauncher() {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    // First-launch check on mount. Defer one frame so the dashboard
    // has a chance to paint underneath — looks cleaner than the
    // tour appearing simultaneously with the loading shell.
    if (isTourComplete()) return
    const t = setTimeout(() => setPending(true), 400)
    return () => clearTimeout(t)
  }, [])

  // External trigger (Settings → Replay).
  React.useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(TOUR_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(TOUR_OPEN_EVENT, onOpen)
  }, [])

  // Promote pending → open once we hit a quiet frame.
  React.useEffect(() => {
    if (pending) setOpen(true)
  }, [pending])

  if (!open) return null
  return <Tour onClose={() => setOpen(false)} />
}

type TourProps = { onClose: () => void }

function Tour({ onClose }: TourProps) {
  const [stepIdx, setStepIdx] = React.useState(0)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const step = STEPS[stepIdx]!

  // Navigate to the step's destination, then measure the anchor.
  // Two-pass so the anchor element actually exists in the DOM.
  React.useEffect(() => {
    if (step.navigateTo && window.location.pathname !== step.navigateTo) {
      navigate(step.navigateTo)
    }
  }, [step.navigateTo, navigate])

  React.useEffect(() => {
    if (!step.anchorKey) {
      setAnchorRect(null)
      return
    }
    // rAF + small delay so layout has settled after any nav.
    let cancelled = false
    const find = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${step.anchorKey}"]`)
      if (el) setAnchorRect(el.getBoundingClientRect())
      else setAnchorRect(null)
    }
    const t1 = setTimeout(find, 50)
    const t2 = setTimeout(find, 250) // second pass in case route is lazy-loading
    const onResize = () => find()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, true)
    return () => {
      cancelled = true
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize, true)
    }
  }, [step.anchorKey, step.navigateTo, stepIdx])

  // Scroll anchor into view if needed.
  React.useEffect(() => {
    if (!step.anchorKey) return
    const el = document.querySelector(`[data-tour="${step.anchorKey}"]`) as HTMLElement | null
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [step.anchorKey, stepIdx])

  const next = async () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1)
    } else {
      await markTourComplete()
      onClose()
    }
  }

  const skip = async () => {
    await markTourComplete()
    onClose()
  }

  const back = () => setStepIdx((i) => Math.max(0, i - 1))

  // Keyboard: Esc skips, Enter / Space advances.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        void skip()
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        void next()
      } else if (e.key === "ArrowRight") {
        next()
      } else if (e.key === "ArrowLeft") {
        back()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[90]"
        role="dialog"
        aria-modal="true"
        aria-label={`Pallio tour — step ${stepIdx + 1} of ${STEPS.length}`}
      >
        {/* Backdrop with a spotlight cutout — drawn as an SVG path so
            the highlighted region stays sharp while everything else
            darkens. When there's no anchor, the whole backdrop dims. */}
        <Backdrop rect={anchorRect} isMobile={isMobile} />

        {/* Caption card */}
        <CaptionCard
          step={step}
          stepIdx={stepIdx}
          total={STEPS.length}
          anchorRect={anchorRect}
          isMobile={isMobile}
          onBack={back}
          onNext={next}
          onSkip={skip}
        />
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function Backdrop({ rect, isMobile }: { rect: DOMRect | null; isMobile: boolean }) {
  // SVG mask cuts a rounded rectangle out of the dark overlay so the
  // anchored UI shows through. When no anchor, just dim everything.
  if (!rect) {
    return <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
  }
  const padding = isMobile ? 6 : 12
  const radius = 16
  const x = Math.max(0, rect.left - padding)
  const y = Math.max(0, rect.top - padding)
  const w = rect.width + padding * 2
  const h = rect.height + padding * 2
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <mask id="pallio-tour-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={radius} ry={radius} fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#pallio-tour-mask)" />
      {/* Brand glow ring on the spotlight edge. */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        ry={radius}
        fill="transparent"
        stroke="var(--brand)"
        strokeWidth={2}
        opacity={0.9}
      />
    </svg>
  )
}

function CaptionCard({
  step,
  stepIdx,
  total,
  anchorRect,
  isMobile,
  onBack,
  onNext,
  onSkip,
}: {
  step: TourStep
  stepIdx: number
  total: number
  anchorRect: DOMRect | null
  isMobile: boolean
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}) {
  // Decide caption position:
  //   - Mobile: always pinned to the bottom of the viewport. Reach
  //     thumb-friendly + the anchor is highlighted up the page.
  //   - Desktop: if there's an anchor, place the card just below /
  //     above it (whichever has more room); otherwise centre.
  const positionStyle: React.CSSProperties = isMobile
    ? { position: "fixed", left: 12, right: 12, bottom: 12 }
    : anchorRect
      ? captionDesktopPosition(anchorRect)
      : { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "min(28rem, calc(100vw - 2rem))" }

  return (
    <motion.div
      key={step.key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 320 }}
      style={positionStyle}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-2xl shadow-black/30",
        isMobile ? "" : "w-[min(28rem,calc(100vw-2rem))]",
      )}
    >
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step {stepIdx + 1} of {total}
          </p>
          <h2 className="text-base font-bold tracking-tight md:text-lg">{step.title}</h2>
        </div>
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip tour"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        {/* Progress pills */}
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-3 rounded-full transition-colors",
                i === stepIdx
                  ? "bg-brand dark:bg-primary"
                  : i < stepIdx
                    ? "bg-brand/40 dark:bg-primary/40"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          {stepIdx > 0 && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={onNext}>
            {step.nextLabel ?? (stepIdx === total - 1 ? "Finish" : "Next")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function captionDesktopPosition(rect: DOMRect): React.CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const W = 448 // panel max width
  const margin = 16

  // Prefer below the anchor when there's room; otherwise above.
  const spaceBelow = vh - rect.bottom
  const spaceAbove = rect.top
  const placeBelow = spaceBelow > 240 || spaceBelow >= spaceAbove
  const top = placeBelow
    ? Math.min(rect.bottom + 12, vh - 240)
    : Math.max(rect.top - 240, margin)

  // Horizontally — anchor centre, clamped into viewport.
  const cx = rect.left + rect.width / 2
  const left = clamp(cx - W / 2, margin, vw - W - margin)

  return { position: "fixed", left, top, width: W }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
