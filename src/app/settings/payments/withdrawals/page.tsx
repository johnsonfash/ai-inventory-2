"use client"

import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const rows = [
  { id: "WD-1001", account: "VA-001", amount: 500, status: "Processing", requestedAt: "2025-08-08" },
  { id: "WD-1002", account: "VA-003", amount: 350, status: "Paid", requestedAt: "2025-08-06" },
]

export default function Withdrawals() {
  return (
    <PageShell title="Payments — Withdrawals" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Payouts</CardTitle>
            <CardDescription>Manage withdrawals to your bank</CardDescription>
          </div>
          <Link href="/settings/payments/withdrawals/new">
            <Button>New Withdrawal</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Account</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Requested</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{r.id}</td>
                    <td className="p-2">{r.account}</td>
                    <td className="p-2 text-right">${r.amount.toFixed(2)}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2">{r.requestedAt}</td>
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
