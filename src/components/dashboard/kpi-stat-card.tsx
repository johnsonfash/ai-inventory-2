import * as React from "react"
import { motion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { InfoTooltip } from "@/components/info-tooltip"
import { cn } from "@/lib/utils"

type Point = { x: string; y: number }

export type KpiTone = "violet" | "emerald" | "amber" | "sky" | "rose" | "fuchsia"

const toneMap: Record<KpiTone, { stroke: string; iconBg: string; iconFg: string }> = {
  violet: {
    stroke: "var(--chart-1)",
    iconBg: "bg-brand-soft dark:bg-primary/15",
    iconFg: "text-brand dark:text-primary",
  },
  emerald: {
    stroke: "var(--chart-2)",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconFg: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    stroke: "var(--chart-3)",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconFg: "text-amber-600 dark:text-amber-300",
  },
  rose: {
    stroke: "var(--chart-4)",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconFg: "text-rose-600 dark:text-rose-300",
  },
  sky: {
    stroke: "var(--chart-5)",
    iconBg: "bg-sky-50 dark:bg-sky-500/10",
    iconFg: "text-sky-600 dark:text-sky-300",
  },
  fuchsia: {
    stroke: "var(--chart-6)",
    iconBg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    iconFg: "text-fuchsia-600 dark:text-fuchsia-300",
  },
}

export type KpiStatCardProps = {
  title: string
  value: string | number
  /** Display string like "+3.2%" or "−12 units". */
  delta?: string
  trend?: "up" | "down" | "neutral"
  Icon?: LucideIcon
  tone?: KpiTone
  /** Mini sparkline data. Pass null/[] to hide the sparkline. */
  data?: Point[] | null
  /** Optional bottom label, e.g. "vs last week". */
  caption?: string
  /** Stagger animation index. Defaults to 0. */
  index?: number
  /** Make the card a fixed mobile-carousel width (~170px) on small. */
  carouselSized?: boolean
  /** Optional inline help — renders an `InfoTooltip` next to the
   *  title. Explains how the metric is computed for users who
   *  haven't seen it before. */
  tooltip?: React.ReactNode
  className?: string
}

export function KpiStatCard({
  title,
  value,
  delta,
  trend = "neutral",
  Icon,
  tone = "violet",
  data,
  caption,
  index = 0,
  carouselSized,
  tooltip,
  className,
}: KpiStatCardProps) {
  const id = React.useId()
  const t = toneMap[tone]

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null
  const trendClasses =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
      : trend === "down"
        ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
        : "text-muted-foreground bg-muted"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 24, stiffness: 240, delay: index * 0.04 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-shadow",
        "hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-black/40",
        carouselSized && "min-w-[170px] snap-start flex-shrink-0",
        className,
      )}
    >
      {/* Soft accent glow behind icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            {tooltip && (
              <InfoTooltip label={title} size="xs">
                {tooltip}
              </InfoTooltip>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums leading-none">{value}</p>
          {(delta || caption) && (
            <div className="mt-2 flex items-center gap-1.5">
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                    trendClasses,
                  )}
                >
                  {TrendIcon && <TrendIcon className="h-3 w-3" />} {delta}
                </span>
              )}
              {caption && (
                <span className="truncate text-[11px] text-muted-foreground">{caption}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.iconBg, t.iconFg)}>
            <Icon className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>
        )}
      </div>

      {data && data.length > 1 && (
        <div className="mt-3 h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.stroke} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke={t.stroke}
                strokeWidth={1.8}
                fill={`url(#spark-${id})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
