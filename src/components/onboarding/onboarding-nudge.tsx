import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { ORG_STEPS, PERSONAL_STEPS } from "./step-definitions"
import { kvJson } from "@/lib/storage/kv"
import { cn } from "@/lib/utils"

// Tiny banner that empty-state pages can drop in to nudge the user
// toward the matching onboarding step. Only renders if:
//   - the step is incomplete in `pallio:onboarding-progress`, AND
//   - the user hasn't dismissed onboarding entirely.
//
// Drops in next to (or inside) an EmptyState — gives the dead-end
// page a clear next action.

const PROGRESS_KEY = "pallio:onboarding-progress"

type Props = {
  /** Step key from ORG_STEPS / PERSONAL_STEPS (e.g. "first-item",
   *  "first-sale", "launch-storefront"). */
  stepKey: string
  /** Override the headline. Defaults to the step's title. */
  title?: string
  /** Override the body. Defaults to the step's description. */
  body?: string
  /** Override the CTA label. Defaults to "Start step". */
  cta?: string
  className?: string
}

export function OnboardingNudge({ stepKey, title, body, cta, className }: Props) {
  const step = React.useMemo(() => [...ORG_STEPS, ...PERSONAL_STEPS].find((s) => s.key === stepKey), [stepKey])
  const [done, setDone] = React.useState<boolean>(() => {
    const map = kvJson.get<Record<string, boolean>>(PROGRESS_KEY) ?? {}
    return !!map[stepKey]
  })

  React.useEffect(() => {
    const onChange = () => {
      const map = kvJson.get<Record<string, boolean>>(PROGRESS_KEY) ?? {}
      setDone(!!map[stepKey])
    }
    window.addEventListener("pallio:onboarding-changed", onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener("pallio:onboarding-changed", onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [stepKey])

  if (!step || done) return null
  const Icon = step.Icon

  return (
    <Link
      to={step.href}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-brand/30 bg-gradient-to-br from-brand-soft/40 via-card to-card p-4 transition-colors hover:border-brand/60 dark:from-primary/10",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/20 blur-2xl" aria-hidden />
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
        <Icon className="h-4 w-4" />
      </span>
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand dark:bg-primary/15 dark:text-primary">
            <Sparkles className="h-2.5 w-2.5" /> Onboarding
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold">{title ?? step.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">{body ?? step.description}</p>
      </div>
      <span className="relative inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-primary">
        {cta ?? "Start step"} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
