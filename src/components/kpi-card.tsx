"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts"
import * as React from "react"

type Point = { x: string; y: number }

export type KpiCardProps = {
  title?: string
  value?: string | number
  delta?: string
  trend?: "up" | "down" | "neutral"
  colorFrom?: string
  colorTo?: string
  data?: Point[]
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const defaultData: Point[] = [
  { x: "W1", y: 12 },
  { x: "W2", y: 16 },
  { x: "W3", y: 14 },
  { x: "W4", y: 20 },
  { x: "W5", y: 18 },
  { x: "W6", y: 24 },
]

export function KpiCard({
  title = "Metric",
  value = "—",
  delta = "0%",
  trend = "neutral",
  colorFrom = "#7c3aed",
  colorTo = "#22c55e",
  data = defaultData,
  Icon,
}: KpiCardProps) {
  const id = React.useId()
  const Up = <ArrowUpRight className="h-4 w-4" />
  const Down = <ArrowDownRight className="h-4 w-4" />
  const Trend = trend === "up" ? Up : trend === "down" ? Down : null
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-500/25 via-violet-500/10 to-emerald-500/20 p-[1px]">
      <Card className="rounded-[11px] border-transparent bg-background/70 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <CardDescription className="sr-only">{"KPI mini chart"}</CardDescription>
            </div>
            {Icon ? (
              <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold tabular-nums">{value}</div>
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              {Trend} {delta}
            </div>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={colorFrom} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={colorTo} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Tooltip cursor={{ strokeOpacity: 0.15 }} />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke={colorFrom}
                  strokeWidth={2}
                  fill={`url(#${id}-grad)`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
