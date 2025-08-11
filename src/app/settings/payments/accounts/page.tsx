"use client"

import Link from "next/link"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"

const rows = [
  { id: "VA-001", bank: "Acme Bank", accountNumber: "0321 4482 1023", location: "Main Store", cashier: "Ava" },
  { id: "VA-002", bank: "Acme Bank", accountNumber: "0321 4482 5581", location: "Main Store", cashier: "Ben" },
  { id: "VA-003", bank: "FinTrust", accountNumber: "9011 2255 0042", location: "Airport Kiosk", cashier: "Chen" },
]

export default function PaymentAccounts() {
  return (
    <PageShell title="Payments — Accounts" withToolbar={false}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Virtual Accounts</CardTitle>
            <CardDescription>Per location and cashier</CardDescription>
          </div>
          <Link href="/settings/payments/accounts/new">
            <Button>Create Account</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Bank</th>
                  <th className="p-2 text-left">Account</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Cashier</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{r.id}</td>
                    <td className="p-2">{r.bank}</td>
                    <td className="p-2 font-mono text-xs">{r.accountNumber}</td>
                    <td className="p-2">{r.location}</td>
                    <td className="p-2">{r.cashier}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Deactivate</Button>
                        <Button variant="outline">Edit</Button>
                      </div>
                    </td>
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
