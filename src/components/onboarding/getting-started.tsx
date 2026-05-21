import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kv, kvJson } from "@/lib/storage/kv"
import { ORG_STEPS, PERSONAL_STEPS, type StepDefinition } from "./step-definitions"
import { CelebrationModal, hasCelebrated } from "./celebration"
import { cn } from "@/lib/utils"

// jax/Zoho-style getting-started milestone card. Lives at the top of
// the dashboard until the user either completes every step or
// dismisses it.
//
// Storage:
//   - kv key `pallio:onboarding-progress` → Record<stepKey, true>.
//     Reads sync from localStorage, writes mirror to Preferences on
//     native so progress survives reinstalls.
//   - kv key `pallio:onboarding-dismissed` → "1" when the user hits
//     "Hide this". Survives reinstalls too.
//   - kv key `pallio:onboarding-collapsed` → "1" when the user has
//     collapsed the card body (keeps it tucked on the dashboard).

const PROGRESS_KEY = "pallio:onboarding-progress"
const DISMISSED_KEY = "pallio:onboarding-dismissed"
const COLLAPSED_KEY = "pallio:onboarding-collapsed"

type ProgressMap = Record<string, boolean>

function readProgress(): ProgressMap {
  return kvJson.get<ProgressMap>(PROGRESS_KEY) ?? {}
}

function readDismissed(): boolean {
  return kv.get(DISMISSED_KEY) === "1"
}

function readCollapsed(): boolean {
  return kv.get(COLLAPSED_KEY) === "1"
}

export function isOnboardingComplete(): boolean {
  if (readDismissed()) return true
  const progress = readProgress()
  const allKeys = [...ORG_STEPS, ...PERSONAL_STEPS].map((s) => s.key)
  return allKeys.every((k) => progress[k])
}

export async function resetOnboarding(): Promise<void> {
  await kv.remove(PROGRESS_KEY)
  await kv.remove(DISMISSED_KEY)
  await kv.remove(COLLAPSED_KEY)
  window.dispatchEvent(new CustomEvent("pallio:onboarding-changed"))
}

export function GettingStarted({ className }: { className?: string }) {
  const [progress, setProgress] = React.useState<ProgressMap>(() => readProgress())
  const [dismissed, setDismissed] = React.useState<boolean>(() => readDismissed())
  const [collapsed, setCollapsed] = React.useState<boolean>(() => readCollapsed())

  // Re-read on external resets (Settings → Replay tour).
  React.useEffect(() => {
    const onChange = () => {
      setProgress(readProgress())
      setDismissed(readDismissed())
      setCollapsed(readCollapsed())
    }
    window.addEventListener("pallio:onboarding-changed", onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener("pallio:onboarding-changed", onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [])

  const allSteps = React.useMemo(() => [...ORG_STEPS, ...PERSONAL_STEPS], [])
  const completedCount = allSteps.filter((s) => progress[s.key]).length
  const totalSteps = allSteps.length
  const pct = Math.round((completedCount / totalSteps) * 100)
  const nextStep = allSteps.find((s) => !progress[s.key])

  // Fire celebration once the final step completes.
  const [celebrationOpen, setCelebrationOpen] = React.useState(false)
  React.useEffect(() => {
    if (completedCount === totalSteps && !hasCelebrated() && !dismissed) {
      setCelebrationOpen(true)
    }
  }, [completedCount, totalSteps, dismissed])

  // Render the celebration on completion; the milestone card itself
  // hides immediately so the modal owns the moment.
  if (completedCount === totalSteps) {
    return <CelebrationModal open={celebrationOpen} onClose={() => setCelebrationOpen(false)} />
  }
  if (dismissed) return null

  const markStep = (key: string) => {
    const next = { ...progress, [key]: true }
    setProgress(next)
    void kvJson.set(PROGRESS_KEY, next)
  }

  const dismiss = () => {
    setDismissed(true)
    void kv.set(DISMISSED_KEY, "1")
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    void kv.set(COLLAPSED_KEY, next ? "1" : "0")
  }

  return (
    <section
      data-tour="onboarding"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
      aria-label="Getting started"
    >
      {/* Brand glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-brand/30 via-fuchsia-500/20 to-transparent blur-3xl"
        aria-hidden
      />

      {/* Header */}
      <div className="relative flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="text-base font-bold tracking-tight md:text-lg">
                Welcome — let's get you set up
              </h2>
              <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                {completedCount}/{totalSteps} · {pct}%
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
              {collapsed
                ? "Expand to pick up where you left off."
                : "Knock these out and your store is production-ready."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link to="/onboarding" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismiss}
              aria-label="Hide checklist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="relative space-y-5 px-4 pb-4 md:px-5 md:pb-5">
          {/* Up next — featured card */}
          {nextStep && (
            <UpNextCard
              step={nextStep}
              index={allSteps.indexOf(nextStep)}
              onMarkDone={() => markStep(nextStep.key)}
            />
          )}

          {/* Org section */}
          <CompactSection
            heading="Set up your business"
            subhead="Owners & managers — one-time org setup."
            steps={ORG_STEPS}
            startIndex={0}
            progress={progress}
            nextKey={nextStep?.key}
            onMarkDone={markStep}
          />

          {/* Personal section */}
          <CompactSection
            heading="Get hands-on"
            subhead="Quick exercises that build muscle memory."
            steps={PERSONAL_STEPS}
            startIndex={ORG_STEPS.length}
            progress={progress}
            nextKey={nextStep?.key}
            onMarkDone={markStep}
          />
        </div>
      )}

      {/* Collapsed-state preview */}
      {collapsed && nextStep && (
        <div className="relative border-t border-border bg-muted/30 px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Up next
            </span>
            <Link
              to={nextStep.href}
              className="flex min-w-0 flex-1 items-center gap-2 truncate text-xs font-semibold text-foreground hover:text-brand dark:hover:text-primary"
            >
              {String(allSteps.indexOf(nextStep) + 1).padStart(2, "0")} · {nextStep.title}
              <ArrowRight className="h-3 w-3 shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

function UpNextCard({
  step,
  index,
  onMarkDone,
}: {
  step: StepDefinition
  index: number
  onMarkDone: () => void
}) {
  const Icon = step.Icon
  return (
    <div className="relative overflow-hidden rounded-xl border border-brand/40 bg-gradient-to-br from-brand/10 via-fuchsia-500/5 to-transparent p-3 dark:border-primary/40 dark:from-primary/10 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm", step.tone)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand dark:bg-primary/20 dark:text-primary">
              Up next
            </span>
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4 className="text-sm font-bold leading-snug">{step.title}</h4>
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {step.description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild size="sm">
            <Link to={step.href}>
              Start <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {step.manualMarkOnly && (
            <Button variant="outline" size="sm" onClick={onMarkDone} className="hidden sm:inline-flex">
              Mark done
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function CompactSection({
  heading,
  subhead,
  steps,
  startIndex,
  progress,
  nextKey,
  onMarkDone,
}: {
  heading: string
  subhead: string
  steps: StepDefinition[]
  startIndex: number
  progress: ProgressMap
  nextKey: string | undefined
  onMarkDone: (key: string) => void
}) {
  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
          {heading}
        </h3>
        <p className="text-[10px] text-muted-foreground">{subhead}</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, idx) => (
          <li key={step.key}>
            <CompactTile
              step={step}
              index={startIndex + idx}
              done={!!progress[step.key]}
              isNext={step.key === nextKey}
              onMarkDone={() => onMarkDone(step.key)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CompactTile({
  step,
  index,
  done,
  isNext,
  onMarkDone,
}: {
  step: StepDefinition
  index: number
  done: boolean
  isNext: boolean
  onMarkDone: () => void
}) {
  const Icon = step.Icon
  return (
    <div
      className={cn(
        "group relative flex h-full items-center gap-2.5 rounded-xl border p-2.5 transition-colors",
        done
          ? "border-emerald-500/30 bg-emerald-500/5"
          : isNext
            ? "border-brand/40 bg-brand-soft/40 dark:border-primary/40 dark:bg-primary/10"
            : "border-border bg-background hover:border-brand/40 hover:bg-accent/40",
      )}
    >
      <Link
        to={step.href}
        className="absolute inset-0 rounded-xl"
        aria-label={`Go to ${step.title}`}
      />
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : step.tone,
        )}
      >
        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          {isNext && !done && (
            <span className="rounded-full bg-brand/15 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-brand dark:bg-primary/20 dark:text-primary">
              Next
            </span>
          )}
        </div>
        <p
          className={cn(
            "truncate text-xs font-semibold leading-tight",
            done && "text-muted-foreground line-through",
          )}
          title={step.title}
        >
          {step.title}
        </p>
      </div>
      {!done && step.manualMarkOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMarkDone()
          }}
          aria-label={`Mark ${step.title} done`}
          className="relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100"
          title="Mark done"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
