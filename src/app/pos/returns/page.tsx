"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getInvoiceByNumber,
  genReturnNumber,
  genId,
  saveReturn,
  type ReturnRecord,
  type Invoice,
} from "@/lib/pos/storage"
import { Input } from "@/components/ui/input"

export default function CreateReturnPage() {
  const router = useRouter()
  const [number, setNumber] = React.useState("")
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [qtys, setQtys] = React.useState<Record<string, number>>({})
  const [method, setMethod] = React.useState<ReturnRecord["method"]>("cash")
  const [reference, setReference] = React.useState("")

  const lookup = () => {
    const inv = getInvoiceByNumber(number.trim())
    setInvoice(inv || null)
    setQtys({})
  }

  const subtotal = invoice ? invoice.items.reduce((s, it) => s + (qtys[it.sku] || 0) * it.price, 0) : 0
  const tax = invoice ? Math.min(invoice.itemTax + (invoice.orderTax || 0), subtotal * 0.2) : 0 // cap sample
  const total = Math.max(0, Math.round((subtotal + tax) * 100) / 100)

  const submit = () => {
    if (!invoice) return
    const items = invoice.items
      .map((it) => ({ ...it, qty: qtys[it.sku] || 0 }))
      .filter((it) => it.qty > 0)
      .map((it) => ({ sku: it.sku, name: it.name, price: it.price, qty: it.qty }))
    if (items.length === 0) return
    const rec: ReturnRecord = {
      id: genId("ret"),
      number: genReturnNumber(),
      createdAt: Date.now(),
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customer: invoice.customer,
      items,
      subtotal,
      tax,
      totalRefund: total,
      method,
      reference: reference || undefined,
    }
    saveReturn(rec)
    router.push(`/pos/returns/${rec.id}`)
  }

  return (
    <PageShell title="Sell Return">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Create Return</CardTitle>
          <CardDescription>Enter an invoice number to begin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Invoice number (e.g. INV-...)"
              className="w-72"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <Button onClick={lookup}>Find</Button>
          </div>

          {!invoice ? (
            <div className="text-sm text-muted-foreground">Search for an invoice to select items to return.</div>
          ) : (
            <>
              <div className="rounded-md border p-3 text-sm">
                <div>
                  <span className="font-medium">Invoice:</span> {invoice.number}
                </div>
                <div>
                  <span className="font-medium">Customer:</span> {invoice.customer?.name || "Walk-in"}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty Purchased</TableHead>
                      <TableHead className="text-right">Qty Return</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Line</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((it) => {
                      const max = it.qty
                      const q = Math.min(qtys[it.sku] || 0, max)
                      const line = q * it.price
                      return (
                        <TableRow key={it.sku}>
                          <TableCell>
                            <div className="font-medium">{it.name}</div>
                            <div className="font-mono text-xs text-muted-foreground">{it.sku}</div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{max}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              className="w-20 text-right"
                              value={q}
                              min={0}
                              max={max}
                              onChange={(e) =>
                                setQtys((prev) => ({
                                  ...prev,
                                  [it.sku]: Math.max(0, Math.min(Number(e.target.value) || 0, max)),
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right tabular-nums">${it.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right tabular-nums">${line.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell className="text-right font-medium">Subtotal</TableCell>
                      <TableCell className="text-right tabular-nums">${subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell className="text-right font-medium">Tax</TableCell>
                      <TableCell className="text-right tabular-nums">${tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell className="text-right font-semibold">Refund Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">${total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="other">Other</option>
                </select>
                <Input
                  placeholder="Reference (last 4, txn id...)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
                <Button onClick={submit} disabled={total <= 0}>
                  Create Return
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
