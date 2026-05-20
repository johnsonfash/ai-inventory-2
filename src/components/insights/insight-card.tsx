import * as React from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { Insight, InsightCategory, InsightSeverity } from "@/lib/insights/types"
import { cn } from "@/lib/utils"

const CATEGORY_ICON: Record<InsightCategory, LucideIcon> = {
  stock: Boxes,
  sales: TrendingUp,
  purchasing: ClipboardList,
  marketing: Megaphone,
  cashflow: Wallet,
  team: Users,
  forecast: Sparkles,
  system: AlertTriangle,
}

const SEV: Record<
  InsightSeverity,
  { badge: string; iconBg: string; metric: string; spark: string }
> = {
  good: {
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    metric: "text-emerald-700 dark:text-emerald-300",
    spark: "stroke-emerald-500",
  },
  info: {
    badge: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    iconBg: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
    metric: "text-brand dark:text-primary",
    spark: "stroke-brand dark:stroke-primary",
  },
  warning: {
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    metric: "text-amber-700 dark:text-amber-300",
    spark: "stroke-amber-500",
  },
  critical: {
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    metric: "text-rose-700 dark:text-rose-300",
    spark: "stroke-rose-500",
  },
}

// One AI insight card. Designed to fit a horizontal snap-scroll on
// mobile (260 px wide) and a 3-column grid on desktop. Click anywhere
// (or focus + Enter on the action) to follow the CTA.
//
// Layout: severity-coloured icon tile, headline + body, optional
// metric chip + sparkline strip, CTA at the bottom.
export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = CATEGORY_ICON[insight.category] ?? Sparkles
  const tone = SEV[insight.severity]
  const Wrapper: React.ElementType = insight.action ? Link : "div"
  const wrapperProps = insight.action ? { to: insight.action.href } : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "group flex h-full w-[18rem] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all",
        "hover:border-brand/40 hover:shadow-sm",
        "md:w-auto",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone.iconBg)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {insight.category}
            </p>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", tone.badge)}>
              {insight.severity === "good" && <CheckCircle2 className="h-2.5 w-2.5" />}
              {insight.severity === "warning" && <AlertTriangle className="h-2.5 w-2.5" />}
              {insight.severity === "critical" && <AlertTriangle className="h-2.5 w-2.5" />}
              {insight.severity}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold leading-tight">{insight.title}</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">{insight.body}</p>

      {(insight.metric || insight.sparkline) && (
        <div className="flex items-end justify-between gap-2 border-t border-border pt-3">
          {insight.metric && (
            <span className={cn("text-base font-bold tabular-nums", tone.metric)}>
              {insight.metric}
            </span>
          )}
          {insight.sparkline && (
            <MiniSparkline
              data={insight.sparkline}
              className={cn("h-7 w-24", tone.spark)}
            />
          )}
        </div>
      )}

      {insight.action && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs font-semibold text-brand transition-colors group-hover:text-brand dark:text-primary">
          <span>{insight.action.label}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </Wrapper>
  )
}

// Tiny inline trend line. Mostly cosmetic — gives the cards a sense
// of motion + makes the dashboard look genuinely data-rich.
function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 100
  const H = 32
  const stepX = W / (data.length - 1)
  const points = data
    .map((v, idx) => {
      const x = idx * stepX
      const y = H - ((v - min) / range) * (H - 4) - 2
      return `${x},${y}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true">
      <polyline
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
