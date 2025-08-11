"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { getReturnById } from "@/lib/pos/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function ReturnDetailPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const rec = getReturnById(params.id)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (search.get("print") === "1" && ref.current) {
      print()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!rec) {
    return (
      <PageShell title="Return">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Return not found.</CardContent>
        </Card>
      </PageShell>
    )
  }

  function print() {
    if (!ref.current) return
    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Return ${rec.number}</title>
<style>
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
th { color: #6b7280; font-weight: 600; }
</style>
</head>
<body>
${ref.current.outerHTML}
<script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); }</script>
</body>
</html>`
    const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900")
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <PageShell title={`Return ${rec.number}`}>
      <div ref={ref}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Return {rec.number}</CardTitle>
            <div className="text-sm text-muted-foreground">{new Date(rec.createdAt).toLocaleString()}</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="font-semibold">Customer</div>
                <div>{rec.customer?.name || "Walk-in"}</div>
              </div>
              <div>
                <div className="font-semibold">Original Invoice</div>
                <div>{rec.invoiceNumber}</div>
              </div>
            </div>
            <div className="overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-3 text-left">Item</th>
                    <th className="h-10 px-3 text-right">Qty</th>
                    <th className="h-10 px-3 text-right">Unit</th>
                    <th className="h-10 px-3 text-right">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.items.map((it) => (
                    <tr key={it.sku} className="border-b">
                      <td className="p-3">{it.name}</td>
                      <td className="p-3 text-right tabular-nums">{it.qty}</td>
                      <td className="p-3 text-right tabular-nums">${it.price.toFixed(2)}</td>
                      <td className="p-3 text-right tabular-nums">${(it.qty * it.price).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3" colSpan={2} />
                    <td className="p-3 text-right font-medium">Tax</td>
                    <td className="p-3 text-right tabular-nums">${rec.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-3" colSpan={2} />
                    <td className="p-3 text-right font-semibold">Refund Total</td>
                    <td className="p-3 text-right font-semibold tabular-nums">${rec.totalRefund.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-sm text-muted-foreground">
              Refunded via {rec.method}
              {rec.reference ? ` • Ref ${rec.reference}` : ""}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={print}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
    </PageShell>
  )
}
