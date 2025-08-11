"use client"

import * as React from "react"
import { useSearchParams, useParams } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { InvoicePreview, printInvoiceNode } from "@/components/pos/invoice-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInvoiceById } from "@/lib/pos/storage"
import { Printer } from "lucide-react"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const invoice = getInvoiceById(params.id)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (search.get("print") === "1" && ref.current) {
      printInvoiceNode(ref.current)
    }
  }, [search])

  if (!invoice) {
    return (
      <PageShell title="Invoice">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Invoice not found.</CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell title={`Invoice ${invoice.number}`}>
      <div ref={ref}>
        <InvoicePreview invoice={invoice} />
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => ref.current && printInvoiceNode(ref.current)}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
    </PageShell>
  )
}
