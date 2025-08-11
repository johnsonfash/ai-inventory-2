"use client"

import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"

const volume = [
  { day: "Mon", amount: 1240 },
  { day: "Tue", amount: 1560 },
  { day: "Wed", amount: 1325 },
  { day: "Thu", amount: 1710 },
  { day: "Fri", amount: 1940 },
  { day: "Sat", amount: 980 },
  { day: "Sun", amount: 860 },
]

const accounts = [
  { id: "VA-001", location: "Main Store", cashier: "Ava", bank: "Acme Bank", balance: 4321.12 },
  { id: "VA-002", location: "Main Store", cashier: "Ben", bank: "Acme Bank", balance: 2180.0 },
  { id: "VA-003", location: "Airport Kiosk", cashier: "Chen", bank: "FinTrust", balance: 1290.55 },
]

export default function PaymentSettings() {
  return (
    <PageShell title="Settings — Payments" withToolbar={false}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>Across all virtual accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              ${accounts.reduce((s, a) => s + a.balance, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payouts</CardTitle>
            <CardDescription>Estimated next 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">$1,250.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Virtual bank accounts</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold tabular-nums">{accounts.length}</div>
            <Link href="/settings/payments/accounts/new">
              <Button>Create Account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Payment Volume</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href="/settings/payments/withdrawals">
              <Button variant="outline">Withdraw</Button>
            </Link>
            <Link href="/settings/payments/accounts">
              <Button>Manage Accounts</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ amount: { label: "Amount", color: "hsl(var(--chart-1))" } }} className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Legend />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="amount" type="monotone" stroke="var(--color-amount)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Top Accounts</CardTitle>
          <CardDescription>By current balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Cashier</th>
                  <th className="p-2 text-left">Bank</th>
                  <th className="p-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{a.id}</td>
                    <td className="p-2">{a.location}</td>
                    <td className="p-2">{a.cashier}</td>
                    <td className="p-2">{a.bank}</td>
                    <td className="p-2 text-right">${a.balance.toFixed(2)}</td>
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
