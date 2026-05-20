import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kv, kvJson } from "@/lib/storage/kv"
import { ORG_STEPS, PERSONAL_STEPS, type StepDefinition } from "./step-definitions"
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
//
// Completion model:
//   - Org steps come first, then Personal steps.
//   - All steps are manual-mark for now (dummy data world). When a
//     real backend lands, swap `markStep` for an API call that
//     server-side checks completion (e.g. visiting /settings/business
//     and saving the form auto-completes the "business" step).

const PROGRESS_KEY = "pallio:onboarding-progress"
const DISMISSED_KEY = "pallio:onboarding-dismissed"

type ProgressMap = Record<string, boolean>

function readProgress(): ProgressMap {
  return kvJson.get<ProgressMap>(PROGRESS_KEY) ?? {}
}

function readDismissed(): boolean {
  return kv.get(DISMISSED_KEY) === "1"
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
  window.dispatchEvent(new CustomEvent("pallio:onboarding-changed"))
}

export function GettingStarted({ className }: { className?: string }) {
  const [progress, setProgress] = React.useState<ProgressMap>(() => readProgress())
  const [dismissed, setDismissed] = React.useState<boolean>(() => readDismissed())

  // Re-read on external resets (Settings → Replay tour).
  React.useEffect(() => {
    const onChange = () => {
      setProgress(readProgress())
      setDismissed(readDismissed())
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

  // Nothing to render if dismissed OR everything done.
  if (dismissed || completedCount === totalSteps) return null

  const markStep = (key: string) => {
    const next = { ...progress, [key]: true }
    setProgress(next)
    void kvJson.set(PROGRESS_KEY, next)
  }

  const dismiss = () => {
    setDismissed(true)
    void kv.set(DISMISSED_KEY, "1")
  }

  return (
    <section
      data-tour="onboarding"
      className={cn(
        "rounded-2xl border border-border bg-card p-4 md:p-5",
        className,
      )}
      aria-label="Getting started"
    >
      {/* Header: title + progress bar + dismiss */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold tracking-tight md:text-lg">
              Welcome — let's get you set up
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold tabular-nums text-foreground">
              {completedCount} of {totalSteps}
            </span>{" "}
            done. This card disappears from your dashboard once everything's checked off.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand via-fuchsia-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismiss}
          className="self-start sm:self-end"
        >
          <X className="h-4 w-4" /> Hide this
        </Button>
      </div>

      {/* Section: org setup */}
      <Section
        heading="Set up your business"
        subhead="One-time setup for the whole organization. Only owners and managers see these."
        steps={ORG_STEPS}
        startIndex={0}
        progress={progress}
        onMarkDone={markStep}
      />

      {/* Section: personal hands-on */}
      <Section
        heading="Get hands-on with the app"
        subhead="Quick exercises so you know exactly how the day-to-day flow works."
        steps={PERSONAL_STEPS}
        startIndex={ORG_STEPS.length}
        progress={progress}
        onMarkDone={markStep}
      />
    </section>
  )
}

function Section({
  heading,
  subhead,
  steps,
  startIndex,
  progress,
  onMarkDone,
}: {
  heading: string
  subhead: string
  steps: StepDefinition[]
  startIndex: number
  progress: ProgressMap
  onMarkDone: (key: string) => void
}) {
  return (
    <div className="mt-5 space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
          {heading}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{subhead}</p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {steps.map((step, idx) => (
          <li key={step.key}>
            <StepCard
              step={step}
              index={startIndex + idx}
              done={!!progress[step.key]}
              onMarkDone={() => onMarkDone(step.key)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepCard({
  step,
  index,
  done,
  onMarkDone,
}: {
  step: StepDefinition
  index: number
  done: boolean
  onMarkDone: () => void
}) {
  const Icon = step.Icon
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-3 transition-colors sm:flex-row sm:items-center sm:p-4",
        done
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-background hover:border-brand/40",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : step.tone,
          )}
        >
          {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4
              className={cn(
                "text-sm font-semibold leading-snug",
                done && "text-muted-foreground line-through",
              )}
            >
              {step.title}
            </h4>
            {done && (
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Done
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
        </div>
      </div>

      {!done && (
        <div className="flex gap-2 sm:w-40 sm:flex-col sm:items-stretch">
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link to={step.href}>
              Go to step
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {step.manualMarkOnly && (
            <Button variant="outline" size="sm" onClick={onMarkDone} className="flex-1 sm:flex-none">
              Mark done
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
