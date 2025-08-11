"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from "recharts"

const kpis = [
  { label: "Active Listings", value: 128 },
  { label: "Weekly Impressions", value: 58210 },
  { label: "Messages", value: 312 },
  { label: "Avg. Response Time", value: "1h 12m" },
]

const trend = [
  { day: "Mon", impressions: 7200, clicks: 260 },
  { day: "Tue", impressions: 8600, clicks: 300 },
  { day: "Wed", impressions: 9100, clicks: 315 },
  { day: "Thu", impressions: 10500, clicks: 370 },
  { day: "Fri", impressions: 12000, clicks: 420 },
  { day: "Sat", impressions: 9800, clicks: 340 },
  { day: "Sun", impressions: 8100, clicks: 290 },
]

const listings = [
  { id: "MK-101", title: "USB‑C Hub 6‑in‑1", price: 39.99, views: 2400, msgs: 35, status: "Active" },
  { id: "MK-102", title: "Wireless Mouse", price: 24.0, views: 1800, msgs: 22, status: "Active" },
  { id: "MK-103", title: "4K HDMI Cable", price: 12.5, views: 900, msgs: 6, status: "Paused" },
]

export default function FacebookMarketplace() {
  return (
    <PageShell title="Marketing — Facebook Marketplace" withToolbar={false}>
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader>
              <CardTitle className="text-base">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">
                {typeof k.value === "number" ? k.value.toLocaleString() : k.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Traffic Trend</CardTitle>
              <CardDescription>Impressions and clicks this week</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/marketing/facebook-ads/new-campaign">
                <Button>Boost</Button>
              </Link>
              <Link href="/marketing/facebook-ads/new-listing">
                <Button variant="outline">New Listing</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                impressions: { label: "Impressions", color: "hsl(var(--chart-1))" },
                clicks: { label: "Clicks", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Legend />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="impressions" type="monotone" stroke="var(--color-impressions)" />
                  <Line dataKey="clicks" type="monotone" stroke="var(--color-clicks)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Listings</CardTitle>
            <CardDescription>Views and messages (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                views: { label: "Views", color: "hsl(var(--chart-3))" },
                msgs: { label: "Messages", color: "hsl(var(--chart-4))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Legend />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="var(--color-views)" />
                  <Bar dataKey="msgs" fill="var(--color-msgs)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Listings</CardTitle>
            <CardDescription>Manage your Marketplace catalog</CardDescription>
          </div>
          <Link href="/marketing/facebook-ads/new-listing">
            <Button>New Listing</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Views</th>
                  <th className="p-2 text-right">Messages</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{l.id}</td>
                    <td className="p-2">{l.title}</td>
                    <td className="p-2 text-right">${l.price.toFixed(2)}</td>
                    <td className="p-2 text-right">{l.views.toLocaleString()}</td>
                    <td className="p-2 text-right">{l.msgs}</td>
                    <td className="p-2">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
