import { getPlatform, isTauriDesktop, isTauriMobile } from "@/lib/platform"
import { formatPriceFor } from "@/contexts/currency"
import { lineNet, type Invoice } from "@/lib/pos/storage"
import { loadReceiptSettings, type ReceiptSettings } from "@/lib/pos/receipt-settings"

// POS-3 hardware bridge. Every native call is dynamically imported and
// platform-guarded so the web/PWA bundle never touches a Tauri plugin —
// mirrors the graceful-degradation pattern used by lib/push (resolves a
// no-op on unsupported platforms rather than throwing).
//
// thermal-printer + serialplugin are NOT available on iOS (the crate's
// build.rs panics there), so thermal features gate on desktop + Android.
// Camera scanning is mobile-only (iOS + Android).

export function canThermalPrint(): boolean {
  return isTauriDesktop() || getPlatform() === "android"
}

export function canCameraScan(): boolean {
  return isTauriMobile()
}

/** List connected thermal printers, or [] when unavailable. */
export async function listPrinters(): Promise<{ name: string; identifier: string; status: string }[]> {
  if (!canThermalPrint()) return []
  try {
    const tp = await import("tauri-plugin-thermal-printer")
    const printers = await tp.list_thermal_printers()
    return printers.map((p) => ({ name: p.name, identifier: p.identifier, status: p.status }))
  } catch {
    return []
  }
}

// Pad a "label .......... value" row to the paper's character width.
function row(label: string, value: string, width: number): string {
  const max = Math.max(0, width - value.length - 1)
  const left = label.length > max ? label.slice(0, max) : label.padEnd(max)
  return `${left} ${value}`
}

/**
 * Print an invoice to the selected thermal printer. `gift` omits prices
 * and adds a return-by line. Returns true on success; callers fall back
 * to the browser print dialog when false.
 */
export async function printInvoiceThermal(invoice: Invoice, opts?: { gift?: boolean }): Promise<boolean> {
  if (!canThermalPrint()) return false
  const s = loadReceiptSettings()
  if (!s.printerName) return false
  try {
    const tp = await import("tauri-plugin-thermal-printer")
    const width = tp.getPaperSizeCharsPerLine(s.paperSize)
    const gift = !!opts?.gift
    const sections: ReturnType<typeof tp.text>[] = []

    if (s.logoDataUrl) {
      // logo() prints a printer-stored NV image by key; for an uploaded
      // data URL we use image() which rasterises host-side.
      try {
        sections.push(tp.image(s.logoDataUrl, { align: tp.TEXT_ALIGN.CENTER }))
      } catch {
        /* image unsupported on this model — skip */
      }
    }
    sections.push(tp.title(s.businessName || "Pallio", { align: tp.TEXT_ALIGN.CENTER }))
    if (s.address) sections.push(tp.text(s.address, { align: tp.TEXT_ALIGN.CENTER }))
    sections.push(tp.text(gift ? "GIFT RECEIPT" : `Receipt ${invoice.number}`, { align: tp.TEXT_ALIGN.CENTER }))
    sections.push(tp.text(new Date(invoice.createdAt).toLocaleString(), { align: tp.TEXT_ALIGN.CENTER }))
    sections.push(tp.line("-"))

    for (const it of invoice.items) {
      sections.push(tp.text(`${it.qty} x ${it.name}`))
      if (it.variantLabel) sections.push(tp.text(`   ${it.variantLabel}`))
      if (!gift) sections.push(tp.text(row("", formatPriceFor(lineNet(it)), width)))
    }
    sections.push(tp.line("-"))

    if (!gift) {
      sections.push(tp.text(row("Subtotal", formatPriceFor(invoice.subtotal), width)))
      if (invoice.itemTax) sections.push(tp.text(row("Tax", formatPriceFor(invoice.itemTax), width)))
      if (invoice.tip) sections.push(tp.text(row("Tip", formatPriceFor(invoice.tip), width)))
      sections.push(tp.title(row("TOTAL", formatPriceFor(invoice.total), width)))
      if (invoice.status === "partial") {
        sections.push(tp.text(row("Paid", formatPriceFor(invoice.paid ?? 0), width)))
        sections.push(tp.title(row("BALANCE", formatPriceFor(invoice.balance ?? 0), width)))
      }
      for (const p of invoice.payments) {
        sections.push(tp.text(row(p.method.toUpperCase(), formatPriceFor(p.amount), width)))
      }
    } else {
      const until = new Date(invoice.createdAt + s.giftReturnDays * 86_400_000)
      sections.push(tp.text(`Returnable until ${until.toLocaleDateString()}`, { align: tp.TEXT_ALIGN.CENTER }))
    }

    sections.push(tp.feed(1))
    if (s.footer) sections.push(tp.text(s.footer, { align: tp.TEXT_ALIGN.CENTER }))
    if (s.social) sections.push(tp.text(s.social, { align: tp.TEXT_ALIGN.CENTER }))
    sections.push(tp.cut())

    await tp.print_thermal_printer({
      printer: s.printerName,
      sections,
      options: { code_page: 0 },
      paper_size: s.paperSize,
    })
    return true
  } catch {
    return false
  }
}

/** Pulse the cash drawer connected to the receipt printer. */
export async function openCashDrawer(): Promise<boolean> {
  if (!canThermalPrint()) return false
  const s = loadReceiptSettings()
  if (!s.printerName) return false
  try {
    const tp = await import("tauri-plugin-thermal-printer")
    await tp.print_thermal_printer({
      printer: s.printerName,
      sections: [tp.drawer(2, 120)],
      options: { code_page: 0 },
      paper_size: s.paperSize,
    })
    return true
  } catch {
    return false
  }
}

/** Open the device camera to scan a barcode. Returns the code, or null. */
export async function scanWithCamera(): Promise<string | null> {
  if (!canCameraScan()) return null
  try {
    const bs = await import("@tauri-apps/plugin-barcode-scanner")
    const res = await bs.scan({ windowed: false })
    return res?.content ?? null
  } catch {
    return null
  }
}

export type { ReceiptSettings }
