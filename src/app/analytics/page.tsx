"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { CategoryBreakdownChart, SalesVsPurchaseChart, StockLevelsChart } from "@/src/components/charts/inventory-charts"

export default function Analytics() {
  return (
    <PageShell title="Analytics" withToolbar={false}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock vs Sold (12 months)</CardTitle>
            <CardDescription>Trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <StockLevelsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Share by category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales vs Purchases</CardTitle>
            <CardDescription>Weekly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesVsPurchaseChart />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
