"use client"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { month: "Jan", profit: 4200 },
  { month: "Feb", profit: 5200 },
  { month: "Mar", profit: 3800 },
  { month: "Apr", profit: 6100 },
  { month: "May", profit: 6700 },
  { month: "Jun", profit: 7400 },
]

export default function ProfitLoss() {
  return (
    <PageShell title="Reporting — Profit & Loss" withToolbar={false}>
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss</CardTitle>
          <CardDescription>Monthly net profit trend</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="profit" type="monotone" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageShell>
  )
}
