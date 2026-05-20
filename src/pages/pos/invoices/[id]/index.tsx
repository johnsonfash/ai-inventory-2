
import * as React from "react"
import { useSearchParams, useParams } from "react-router-dom"
import { Printer, Share2 } from "lucide-react"
import { toast } from "sonner"
import { PageShell } from "@/components/page-shell"
import { InvoicePreview, printInvoiceNode } from "@/components/pos/invoice-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInvoiceById } from "@/lib/pos/storage"
import { useShare } from "@/hooks/use-share"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const [search] = useSearchParams()
  const invoice = getInvoiceById(params.id ?? "")
  const ref = React.useRef<HTMLDivElement>(null)
  const share = useShare()

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

  const onShare = async () => {
    // Construct an absolute URL so external apps that follow the
    // link (Mail, Messages, Slack) land on the right invoice. Works
    // both on web (uses location.origin) and native (same — the
    // Capacitor build runs under https://localhost so links resolve
    // to the deployed pallio.app via the universal link config).
    const origin = window.location.origin.includes("localhost")
      ? "https://pallio.app"
      : window.location.origin
    const url = `${origin}/pos/invoices/${invoice.id}`
    const total = `$${invoice.total.toFixed(2)}`
    const customer = invoice.customer?.name ?? "Walk-in"
    const res = await share({
      title: `Invoice ${invoice.number}`,
      text: `Invoice ${invoice.number} — ${customer} — ${total}`,
      url,
      dialogTitle: "Share invoice",
    })
    if (res.kind === "copied") toast.success("Invoice link copied")
    else if (res.kind === "unavailable") toast.error("Sharing not available on this device")
  }

  return (
    <PageShell title={`Invoice ${invoice.number}`}>
      <div ref={ref}>
        <InvoicePreview invoice={invoice} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button onClick={() => ref.current && printInvoiceNode(ref.current)}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>
    </PageShell>
  )
}
