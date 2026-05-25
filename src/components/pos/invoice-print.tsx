import { lineDiscountValue, lineNet, type Invoice } from "@/lib/pos/storage"
import { loadReceiptSettings } from "@/lib/pos/receipt-settings"
import { formatPriceFor } from "@/contexts/currency"

export function printInvoiceNode(node: HTMLElement) {
  const win = window.open("", "_blank", "width=720,height=900")
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; margin: 0; padding: 16px; color: #111; }
          .title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
          .muted { color: #555; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
          .right { text-align: right; }
          .totals td { border: none; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 6px; background: #f1f5f9; font-size: 11px; }
        </style>
      </head>
      <body>${node.outerHTML}</body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
  setTimeout(() => win.close(), 300)
}

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const d = new Date(invoice.createdAt)
  return (
    <div>
      <div className="title">
        {"Invoice "}
        {invoice.number}
      </div>
      <div className="muted">{`Date: ${d.toLocaleString()}`}</div>
      {invoice.meta?.location && <div className="muted">{`Location: ${invoice.meta.location}`}</div>}
      {invoice.meta?.salesperson && <div className="muted">{`Salesperson: ${invoice.meta.salesperson}`}</div>}
      <div className="muted">
        {"Customer: "}
        {invoice.customer?.name || "Guest"}
        {" • "}
        {invoice.customer?.email || ""} {invoice.customer?.phone || ""}
      </div>
      <table>
        <thead>
          <tr>
            <th>{"Item"}</th>
            <th className="right">{"Qty"}</th>
            <th className="right">{"Price"}</th>
            <th className="right">{"Line"}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => {
            const disc = lineDiscountValue(it)
            return (
              <tr key={it.sku}>
                <td>
                  <div className="title" style={{ fontSize: 13, fontWeight: 600 }}>
                    {it.name}
                  </div>
                  <div className="muted">
                    {it.sku}
                    {disc > 0 ? ` • less ${formatPriceFor(disc)}` : ""}
                  </div>
                </td>
                <td className="right">{it.qty}</td>
                <td className="right">{formatPriceFor(it.price)}</td>
                <td className="right">{formatPriceFor(lineNet(it))}</td>
              </tr>
            )
          })}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right">{"Subtotal"}</td>
            <td className="right">{formatPriceFor(invoice.subtotal)}</td>
          </tr>
          {invoice.discount ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Discount"}</td>
              <td className="right">
                {invoice.discountType === "percent" ? `${invoice.discount}%` : formatPriceFor(invoice.discount)}
              </td>
            </tr>
          ) : null}
          {invoice.shipping ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Shipping"}</td>
              <td className="right">{formatPriceFor(invoice.shipping)}</td>
            </tr>
          ) : null}
          {invoice.serviceFee ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Service Fee"}</td>
              <td className="right">{formatPriceFor(invoice.serviceFee)}</td>
            </tr>
          ) : null}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right">{"Item Tax"}</td>
            <td className="right">{formatPriceFor(invoice.itemTax)}</td>
          </tr>
          {invoice.orderTaxPercent ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{`Order Tax (${invoice.orderTaxPercent}%)`}</td>
              <td className="right">{formatPriceFor(invoice.orderTax)}</td>
            </tr>
          ) : null}
          {invoice.tip ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Tip"}</td>
              <td className="right">{formatPriceFor(invoice.tip)}</td>
            </tr>
          ) : null}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right" style={{ fontWeight: 700 }}>
              {"Total"}
            </td>
            <td className="right" style={{ fontWeight: 700 }}>
              {formatPriceFor(invoice.total)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8 }} className="muted">
        {"Payments: "}
        {invoice.payments.map((p, i) => (
          <span key={i} className="badge" style={{ marginRight: 6 }}>
            {p.method.toUpperCase()} {formatPriceFor(p.amount)}
            {p.reference ? ` • ${p.reference}` : ""}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <span className="badge">{"Thank you for your business!"}</span>
      </div>
    </div>
  )
}

export function ReceiptPreview({ invoice, gift }: { invoice: Invoice; gift?: boolean }) {
  const d = new Date(invoice.createdAt)
  const s = loadReceiptSettings()
  const returnBy = new Date(invoice.createdAt + s.giftReturnDays * 86_400_000)
  return (
    <div>
      {s.logoDataUrl && (
        <img src={s.logoDataUrl} alt="" style={{ maxHeight: 56, marginBottom: 6 }} />
      )}
      <div className="title">{s.businessName || "Pallio"}</div>
      {s.address && <div className="muted">{s.address}</div>}
      <div className="muted">
        {gift ? "GIFT RECEIPT · " : "Receipt "}
        {invoice.number}
      </div>
      <div className="muted">{d.toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            <th>{"Item"}</th>
            <th className="right">{"Qty"}</th>
            {!gift && <th className="right">{"Line"}</th>}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.sku}>
              <td>{it.name}{it.variantLabel ? ` (${it.variantLabel})` : ""}</td>
              <td className="right">{it.qty}</td>
              {!gift && <td className="right">{formatPriceFor(lineNet(it))}</td>}
            </tr>
          ))}
          {!gift && invoice.tip ? (
            <tr className="totals">
              <td />
              <td className="right">{"Tip"}</td>
              <td className="right">{formatPriceFor(invoice.tip)}</td>
            </tr>
          ) : null}
          {!gift && (
            <tr className="totals">
              <td />
              <td className="right" style={{ fontWeight: 700 }}>
                {"Total"}
              </td>
              <td className="right" style={{ fontWeight: 700 }}>
                {formatPriceFor(invoice.total)}
              </td>
            </tr>
          )}
          {!gift && invoice.status === "partial" ? (
            <>
              <tr className="totals">
                <td />
                <td className="right">{"Paid"}</td>
                <td className="right">{formatPriceFor(invoice.paid ?? 0)}</td>
              </tr>
              <tr className="totals">
                <td />
                <td className="right" style={{ fontWeight: 700 }}>{"Balance due"}</td>
                <td className="right" style={{ fontWeight: 700 }}>{formatPriceFor(invoice.balance ?? 0)}</td>
              </tr>
            </>
          ) : null}
        </tbody>
      </table>
      {gift ? (
        <div style={{ marginTop: 8 }} className="muted">
          {`Returnable with this receipt until ${returnBy.toLocaleDateString()}.`}
        </div>
      ) : (
        <>
          <div style={{ marginTop: 8 }} className="muted">
            {"Payments: "}
            {invoice.payments.map((p, i) => (
              <span key={i} className="badge" style={{ marginRight: 6 }}>
                {p.method.toUpperCase()} {formatPriceFor(p.amount)}
              </span>
            ))}
          </div>
          {invoice.status === "partial" && (
            <div style={{ marginTop: 8 }}>
              <span className="badge">{`Layaway — ${formatPriceFor(invoice.balance ?? 0)} balance owed`}</span>
            </div>
          )}
        </>
      )}
      {s.footer && <div style={{ marginTop: 8 }} className="muted">{s.footer}</div>}
      {s.social && <div className="muted">{s.social}</div>}
    </div>
  )
}
