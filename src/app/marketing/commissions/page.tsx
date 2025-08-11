"use client"

import * as React from "react"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { CommissionCalculator } from "@/src/components/team/commission-calculator"
import { ExportCSVButton, ExportPDFButton } from "@/src/components/export-buttons"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { aggregateSalesBySalesperson } from "@/src/lib/pos/storage"
import { RoleGuard } from "@/src/components/auth/role-guard"

type SpRow = { salesperson: string; sales: number; revenue: number }

export default function MarketingCommissionsPage() {
  const [data, setData] = React.useState<SpRow[]>(aggregateSalesBySalesperson())
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)

  React.useEffect(() => {
    // Try DB-backed API, else fallback to local
    fetch("/api/analytics/teams")
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res?.bySalesperson)) {
          setData(
            res.bySalesperson.map((r: any) => ({
              salesperson: r.salesperson || "Unassigned",
              sales: Number(r.sales) || 0,
              revenue: Number(r.revenue) || 0,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <RoleGuard permission="view:commissions">
      <PageShell title="Marketing — Commissions & Bonuses" withToolbar>
        <div className="mb-2 flex items-center gap-2">
          <ExportCSVButton data={data} filename="commissions.csv" />
          <ExportPDFButton selector="#commissions-report" filename="commissions.pdf" />
        </div>
        <div id="commissions-report" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue by Salesperson</CardTitle>
              <CardDescription>Track commissions potential</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
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

          <CommissionCalculator totalRevenue={totalRevenue} />

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Team Summary</CardTitle>
              <CardDescription>Sales counts and revenue by salesperson</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salesperson</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.salesperson}>
                        <TableCell className="font-medium">{row.salesperson}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.sales}</TableCell>
                        <TableCell className="text-right tabular-nums">${row.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No data yet.
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
