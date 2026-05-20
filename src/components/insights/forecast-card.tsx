import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { ChartTooltipContent } from "@/components/ui/chart"
import { InfoTooltip } from "@/components/info-tooltip"
import { generateForecast } from "@/lib/insights/engine"
import { cn } from "@/lib/utils"

const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const

// Next-7-day revenue forecast. Area-chart with a confidence band
// (lower/upper) painted lighter underneath. The summary line sums
// the predicted revenue + averages the band width into a ± figure
// so the user gets an at-a-glance "how confident is the model".
export function ForecastCard({ className }: { className?: string }) {
  const data = React.useMemo(() => generateForecast(), [])
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const avgBand = data.reduce((s, d) => s + (d.upper - d.lower) / 2, 0) / data.length
  const bandPct = Math.round((avgBand / (totalRevenue / data.length)) * 100)

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-semibold md:text-base">Next 7 days</h3>
            <InfoTooltip label="Revenue forecast" size="xs">
              Pallio projects revenue over the next 7 days using your
              rolling 30‑day trend + day-of-week seasonality. The
              shaded band is the confidence interval — wider days
              further out reflect less certainty.
            </InfoTooltip>
          </div>
          <p className="text-[11px] text-muted-foreground">Forecast revenue + confidence band</p>
        </div>
        <Link
          to="/reporting/sales"
          className="text-[11px] font-semibold text-brand transition-colors hover:text-brand/80 dark:text-primary"
        >
          Detail →
        </Link>
      </header>

      {/* Top-line numbers */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-dashed border-border bg-background/40 p-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected</p>
          <p className="text-base font-bold tabular-nums">${(totalRevenue / 1000).toFixed(1)}k</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Band</p>
          <p className="text-base font-bold tabular-nums text-muted-foreground">±{bandPct}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trend</p>
          <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">+ rising</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 md:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="forecast-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="day" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={36} />
            <Tooltip content={<ChartTooltipContent labelKey="day" />} cursor={{ stroke: "var(--border)" }} />
            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="url(#forecast-band)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="var(--background)"
              isAnimationActive={false}
            />
            {/* Headline forecast line */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#forecast-fill)"
              dot={{ r: 2.5, fill: "var(--chart-1)" }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
