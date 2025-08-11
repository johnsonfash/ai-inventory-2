"use client"

import * as React from "react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ExportCSVButton, ExportPDFButton } from "@/components/export-buttons"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import Link from "next/link"
import { RoleGuard } from "@/components/auth/role-guard"
import { aggregateSalesByChannel, aggregateSalesByLocation, aggregateSalesBySalesperson } from "@/lib/pos/storage"

type SpRow = { salesperson: string; sales: number; revenue: number; commission?: number }
type LocRow = { location: string; sales: number; revenue: number }
type ChRow = { channel: string; sales: number; revenue: number }
type TeamAPI = { bySalesperson: SpRow[]; byLocation: LocRow[]; byChannel: ChRow[] }

const kpi = (rows: SpRow[]) => {
  const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0)
  const totalSales = rows.reduce((sum, r) => sum + (r.sales || 0), 0)
  const avgOrder = totalSales ? totalRevenue / totalSales : 0
  return { totalRevenue, totalSales, avgOrder }
}

export default function TeamPerformancePage() {
  const [range, setRange] = React.useState<"7" | "30" | "90" | "all">("30")
  const [commissionRate, setCommissionRate] = React.useState<number>(5) // %
  const [bySp, setBySp] = React.useState<SpRow[]>(aggregateSalesBySalesperson())
  const [byLoc, setByLoc] = React.useState<LocRow[]>(aggregateSalesByLocation())
  const [byCh, setByCh] = React.useState<ChRow[]>(aggregateSalesByChannel())
  const [loading, setLoading] = React.useState(false)

  // Fetch from API if available; otherwise fallback to local aggregations.
  React.useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/analytics/teams?range=${range}`)
        if (!res.ok) throw new Error("bad status")
        const data = (await res.json()) as TeamAPI
        if (ignore) return
        if (Array.isArray(data.bySalesperson)) setBySp(data.bySalesperson)
        if (Array.isArray(data.byLocation)) setByLoc(data.byLocation)
        if (Array.isArray(data.byChannel)) setByCh(data.byChannel)
      } catch {
        // no-op: fallback already set
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [range])

  // Apply commission rate locally to the salesperson rows.
  const withCommission: SpRow[] = React.useMemo(
    () =>
      bySp.map((r) => ({
        ...r,
        commission: Number(((r.revenue || 0) * (commissionRate / 100)).toFixed(2)),
      })),
    [bySp, commissionRate],
  )

  const { totalRevenue, totalSales, avgOrder } = kpi(bySp)

  return (
    <RoleGuard permission="view:team">
      <PageShell title="Sales — Team Performance" withToolbar>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {/* Time range quick filter */}
          <label className="text-sm text-muted-foreground">Range</label>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value as any)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Commission rate control */}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="commission" className="text-sm text-muted-foreground">
              Commission %
            </label>
            <Input
              id="commission"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value || 0))}
              className="w-20"
              type="number"
              step="0.5"
              min={0}
            />
            <ExportCSVButton data={withCommission} filename="team-performance.csv" />
            <ExportPDFButton selector="#team-report" filename="team-report.pdf" />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>{range === "all" ? "All time" : `Last ${range} days`}</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">${totalRevenue.toFixed(2)}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Sales</CardTitle>
              <CardDescription>Invoices counted</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">{totalSales}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Avg. Order</CardTitle>
              <CardDescription>Revenue per sale</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold tabular-nums">${avgOrder.toFixed(2)}</CardContent>
          </Card>
        </div>

        <div id="team-report" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue by Salesperson</CardTitle>
              <CardDescription>Performance ranking</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-1))" } }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySp}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="salesperson" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue by Location</CardTitle>
              <CardDescription>Where sales happen</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byLoc}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Revenue by Channel</CardTitle>
              <CardDescription>Sales source overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-3))" } }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCh}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Team Table</CardTitle>
              <CardDescription>Sales, revenue and commission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salesperson</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withCommission.map((row) => (
                      <TableRow key={row.salesperson}>
                        <TableCell className="font-medium">{row.salesperson}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.sales}</TableCell>
                        <TableCell className="text-right tabular-nums">${row.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right tabular-nums">${row.commission?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/sales/team/${encodeURIComponent(row.salesperson)}`}>
                            <span className="rounded border px-2 py-1 text-sm hover:bg-accent">View</span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {withCommission.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          {loading ? "Loading..." : "No data yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </RoleGuard>
  )
}
