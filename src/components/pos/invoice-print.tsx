"use client"
import type { Invoice } from "@/lib/pos/storage"

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
          {invoice.items.map((it) => (
            <tr key={it.sku}>
              <td>
                <div className="title" style={{ fontSize: 13, fontWeight: 600 }}>
                  {it.name}
                </div>
                <div className="muted">{it.sku}</div>
              </td>
              <td className="right">{it.qty}</td>
              <td className="right">${it.price.toFixed(2)}</td>
              <td className="right">${(it.qty * it.price).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right">{"Subtotal"}</td>
            <td className="right">${invoice.subtotal.toFixed(2)}</td>
          </tr>
          {invoice.discount ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Discount"}</td>
              <td className="right">
                {invoice.discountType === "percent" ? `${invoice.discount}%` : `$${invoice.discount.toFixed(2)}`}
              </td>
            </tr>
          ) : null}
          {invoice.shipping ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Shipping"}</td>
              <td className="right">${invoice.shipping.toFixed(2)}</td>
            </tr>
          ) : null}
          {invoice.serviceFee ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{"Service Fee"}</td>
              <td className="right">${invoice.serviceFee.toFixed(2)}</td>
            </tr>
          ) : null}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right">{"Item Tax"}</td>
            <td className="right">${invoice.itemTax.toFixed(2)}</td>
          </tr>
          {invoice.orderTaxPercent ? (
            <tr className="totals">
              <td colSpan={2} />
              <td className="right">{`Order Tax (${invoice.orderTaxPercent}%)`}</td>
              <td className="right">${invoice.orderTax.toFixed(2)}</td>
            </tr>
          ) : null}
          <tr className="totals">
            <td colSpan={2} />
            <td className="right" style={{ fontWeight: 700 }}>
              {"Total"}
            </td>
            <td className="right" style={{ fontWeight: 700 }}>
              ${invoice.total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8 }} className="muted">
        {"Payments: "}
        {invoice.payments.map((p, i) => (
          <span key={i} className="badge" style={{ marginRight: 6 }}>
            {p.method.toUpperCase()} ${p.amount.toFixed(2)}
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

export function ReceiptPreview({ invoice }: { invoice: Invoice }) {
  const d = new Date(invoice.createdAt)
  return (
    <div>
      <div className="title">
        {"Receipt "}
        {invoice.number}
      </div>
      <div className="muted">{d.toLocaleString()}</div>
      <table>
        <thead>
          <tr>
            <th>{"Item"}</th>
            <th className="right">{"Qty"}</th>
            <th className="right">{"Line"}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.sku}>
              <td>{it.name}</td>
              <td className="right">{it.qty}</td>
              <td className="right">${(it.qty * it.price).toFixed(2)}</td>
            </tr>
          ))}
          <tr className="totals">
            <td />
            <td className="right" style={{ fontWeight: 700 }}>
              {"Total"}
            </td>
            <td className="right" style={{ fontWeight: 700 }}>
              ${invoice.total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8 }} className="muted">
        {"Payments: "}
        {invoice.payments.map((p, i) => (
          <span key={i} className="badge" style={{ marginRight: 6 }}>
            {p.method.toUpperCase()} ${p.amount.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  )
}
