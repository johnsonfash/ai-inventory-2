"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  getInvoiceById,
  getInvoiceByNumber,
  genId,
  genReturnNumber,
  saveReturn,
  type Invoice,
  type ReturnRecord,
} from "@/lib/pos/storage"

export default function NewReturnPage() {
  const router = useRouter()
  const search = useSearchParams()
  const invoiceId = search.get("invoiceId") || ""
  const invoiceNumber = search.get("invoiceNumber") || ""

  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [qtys, setQtys] = React.useState<Record<string, number>>({})
  const [method, setMethod] = React.useState<ReturnRecord["method"]>("card")
  const [reference, setReference] = React.useState("")

  React.useEffect(() => {
    const inv = invoiceId ? getInvoiceById(invoiceId) : invoiceNumber ? getInvoiceByNumber(invoiceNumber) : undefined
    setInvoice(inv || null)
    if (inv) {
      const init: Record<string, number> = {}
      for (const it of inv.items) init[it.sku] = 0
      setQtys(init)
    }
  }, [invoiceId, invoiceNumber])

  if (!invoice) {
    return (
      <PageShell title="POS — New Return" withToolbar={false}>
        <Card>
          <CardHeader>
            <CardTitle>Find Invoice</CardTitle>
            <CardDescription>Provide invoice number to start a return</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const num = (e.target as HTMLFormElement).invoice.value as string
                if (!num.trim()) return
                const inv = getInvoiceByNumber(num.trim())
                setInvoice(inv || null)
                if (inv) {
                  const init: Record<string, number> = {}
                  for (const it of inv.items) init[it.sku] = 0
                  setQtys(init)
                } else {
                  alert("Invoice not found")
                }
              }}
            >
              <Input name="invoice" placeholder="Invoice number" className="max-w-sm" />
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  const subtotal = invoice.items.reduce((s, it) => s + (qtys[it.sku] || 0) * it.price, 0)
  const tax = invoice.items.reduce((s, it) => s + (qtys[it.sku] || 0) * it.price * (it.taxRate || 0), 0)
  const totalRefund = Math.max(0, Math.round((subtotal + tax) * 100) / 100)

  function submitReturn() {
    const anyQty = Object.values(qtys).some((q) => q > 0)
    if (!anyQty) return alert("Select at least one quantity to return.")
    const rec: ReturnRecord = {
      id: genId("ret"),
      number: genReturnNumber(),
      createdAt: Date.now(),
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      customer: invoice.customer,
      items: invoice.items
        .filter((it) => (qtys[it.sku] || 0) > 0)
        .map((it) => ({ sku: it.sku, name: it.name, price: it.price, qty: qtys[it.sku] })),
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      totalRefund,
      method,
      reference: reference || undefined,
    }
    saveReturn(rec)
    alert(`Return created: ${rec.number}`)
    router.push("/pos/returns")
  }

  return (
    <PageShell title="POS — New Return" withToolbar={false}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Return for {invoice.number}</CardTitle>
          <CardDescription>{new Date(invoice.createdAt).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Return Qty</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((it) => (
                  <TableRow key={it.sku}>
                    <TableCell>
                      <div className="font-medium">{it.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{it.sku}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{it.qty}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        className="w-20 text-right"
                        type="number"
                        min={0}
                        max={it.qty}
                        value={qtys[it.sku] || 0}
                        onChange={(e) => {
                          const v = Math.min(it.qty, Math.max(0, Number(e.target.value) || 0))
                          setQtys((q) => ({ ...q, [it.sku]: v }))
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">${it.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-2 sm:max-w-md">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Refund Method</span>
              <select
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Reference (optional)</span>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ref code" />
            </label>
          </div>

          <div className="mt-2 rounded border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">${(Math.round(subtotal * 100) / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums">${(Math.round(tax * 100) / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total Refund</span>
              <span className="tabular-nums">${totalRefund.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={submitReturn} disabled={totalRefund <= 0}>
              Create Return
            </Button>
            <Button variant="outline" className="bg-transparent" onClick={() => history.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
