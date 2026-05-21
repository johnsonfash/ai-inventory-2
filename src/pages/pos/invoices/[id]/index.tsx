
import * as React from "react"
import { Link, useSearchParams, useParams } from "react-router-dom"
import { Mail, Printer, Share2 } from "lucide-react"
import { toast } from "sonner"
import { PageShell } from "@/components/page-shell"
import { InvoicePreview, printInvoiceNode } from "@/components/pos/invoice-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInvoiceById } from "@/lib/pos/storage"
import { useShare } from "@/hooks/use-share"
import { useCurrency } from "@/contexts/currency"

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const [search] = useSearchParams()
  const invoice = getInvoiceById(params.id ?? "")
  const ref = React.useRef<HTMLDivElement>(null)
  const share = useShare()
  const { formatPrice } = useCurrency()

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
    const total = formatPrice(invoice.total)
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
    <PageShell
      title={`Invoice ${invoice.number}`}
      titleTooltip={
        <>
          A formal invoice generated at the till — printed copy plus
          PDF email to the customer. Different from the regular
          /sales/invoices flow because POS invoices are paid in full
          at the moment of issue.
        </>
      }
    >
      <div ref={ref}>
        <InvoicePreview invoice={invoice} />
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Link
          to={`/communications/new?template=tpl-invoice${invoice.customer?.email ? `&to=${encodeURIComponent(invoice.customer.email)}` : ""}`}
        >
          <Button variant="outline">
            <Mail className="h-4 w-4" /> Send via email
          </Button>
        </Link>
        <Button variant="outline" onClick={onShare}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button onClick={() => ref.current && printInvoiceNode(ref.current)}>
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>
    </PageShell>
  )
}
