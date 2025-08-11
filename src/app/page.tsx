"use client"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react"
import { KpiCard } from "@/components/kpi-card"
import { CategoryBreakdownChart, SalesVsPurchaseChart, StockLevelsChart } from "@/components/charts/inventory-charts"
import { InventoryTable } from "@/components/inventory-table"
import { TopMovers } from "@/components/top-movers"
import { TopSelling } from "@/components/top-selling"

export default function Dashboard() {
  return (
    <PageShell title="Inventory Dashboard" withToolbar>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total SKUs" value="1,284" delta="3.2%" trend="up" />
          <KpiCard title="Units in Stock" value="15,940" delta="1.1%" trend="up" />
          <KpiCard title="Out of Stock" value="12" delta="0.4%" trend="down" colorFrom="#ef4444" colorTo="#f59e0b" />
          <KpiCard title="Pending Orders" value="87" delta="5.6%" trend="up" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Stock vs Sold</CardTitle>
              <CardDescription>Monthly movement</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <StockLevelsChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Share by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <CategoryBreakdownChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales vs Purchases (weekly)</CardTitle>
                  <CardDescription>Compare movement across the week</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center text-emerald-600">
                    <ArrowUpRight className="mr-1 h-4 w-4" /> Sales
                  </span>
                  <span className="flex items-center text-violet-600">
                    <ArrowDownRight className="mr-1 h-4 w-4 rotate-90" /> Purchases
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <SalesVsPurchaseChart />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Low Stock Items
              </CardTitle>
              <CardDescription>Items below reorder point</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <InventoryTable />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <TopSelling />
            <TopMovers />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
