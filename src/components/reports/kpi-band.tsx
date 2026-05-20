import * as React from "react"
import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export type ReportKpiTone = "violet" | "emerald" | "amber" | "rose" | "sky" | "fuchsia"

const TONES: Record<ReportKpiTone, { stroke: string; iconBg: string; iconFg: string }> = {
  violet: { stroke: "var(--chart-1)", iconBg: "bg-brand-soft dark:bg-primary/15", iconFg: "text-brand dark:text-primary" },
  emerald: { stroke: "var(--chart-2)", iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconFg: "text-emerald-600 dark:text-emerald-300" },
  amber: { stroke: "var(--chart-3)", iconBg: "bg-amber-50 dark:bg-amber-500/10", iconFg: "text-amber-600 dark:text-amber-300" },
  rose: { stroke: "var(--chart-4)", iconBg: "bg-rose-50 dark:bg-rose-500/10", iconFg: "text-rose-600 dark:text-rose-300" },
  sky: { stroke: "var(--chart-5)", iconBg: "bg-sky-50 dark:bg-sky-500/10", iconFg: "text-sky-600 dark:text-sky-300" },
  fuchsia: { stroke: "var(--chart-6)", iconBg: "bg-fuchsia-50 dark:bg-fuchsia-500/10", iconFg: "text-fuchsia-600 dark:text-fuchsia-300" },
}

export type KpiBandItem = {
  title: string
  value: string | number
  delta?: string
  trend?: "up" | "down" | "neutral"
  Icon?: LucideIcon
  tone?: ReportKpiTone
  /** Sparkline data; pass null/[] to hide. */
  data?: { x: string | number; y: number }[] | null
  /** Comparison line (e.g. "vs last month") under the delta pill. */
  caption?: string
}

type Props = {
  items: KpiBandItem[]
  className?: string
}

// Report-page KPI band. Snap-scroll on mobile, grid on md+. Sparklines
// are theme-aware (read from --chart-* CSS vars).
export function KpiBand({ items, className }: Props) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory",
        "md:mx-0 md:grid md:gap-3 md:overflow-visible md:px-0",
        items.length === 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
        className,
      )}
    >
      {items.map((it, i) => (
        <KpiTile key={it.title} item={it} index={i} />
      ))}
    </div>
  )
}

function KpiTile({ item, index }: { item: KpiBandItem; index: number }) {
  const id = React.useId()
  const t = TONES[item.tone ?? "violet"]
  const Icon = item.Icon
  const TrendIcon = item.trend === "up" ? ArrowUpRight : item.trend === "down" ? ArrowDownRight : null
  const trendClasses =
    item.trend === "up"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
      : item.trend === "down"
        ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
        : "text-muted-foreground bg-muted"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 240, delay: index * 0.04 }}
      className="min-w-[170px] snap-start flex-shrink-0 rounded-2xl border border-border bg-card p-4 md:min-w-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums leading-none">{item.value}</p>
          {(item.delta || item.caption) && (
            <div className="mt-2 flex items-center gap-1.5">
              {item.delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                    trendClasses,
                  )}
                >
                  {TrendIcon && <TrendIcon className="h-3 w-3" />} {item.delta}
                </span>
              )}
              {item.caption && <span className="truncate text-[11px] text-muted-foreground">{item.caption}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.iconBg, t.iconFg)}>
            <Icon className="h-4 w-4" strokeWidth={2.1} />
          </span>
        )}
      </div>
      {item.data && item.data.length > 1 && (
        <div className="mt-3 h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={item.data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`b-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.stroke} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="y" stroke={t.stroke} strokeWidth={1.6} fill={`url(#b-${id})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
