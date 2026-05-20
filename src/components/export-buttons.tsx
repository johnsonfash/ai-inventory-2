import * as React from "react"
import { Button } from "@/components/ui/button"

// Both buttons only kick off heavy work when the user clicks them, so
// jspdf + html2canvas are dynamically imported inside the handlers.
// Eager imports here would drag ~570 KiB into every bundle that
// touched a page using these components.

export function ExportCSVButton<T extends Record<string, unknown>>({
  data,
  filename = "export.csv",
}: {
  data: T[]
  filename?: string
}) {
  function toCSV(rows: T[]) {
    if (rows.length === 0) return ""
    const headers = Object.keys(rows[0]!)
    const escape = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`
    const lines = [headers.map(escape).join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))]
    return lines.join("\n")
  }

  function downloadCSV() {
    const blob = new Blob([toCSV(data)], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" className="bg-transparent" onClick={downloadCSV}>
      Export CSV
    </Button>
  )
}

export function ExportPDFButton({
  selector,
  filename = "export.pdf",
}: {
  selector: string
  filename?: string
}) {
  const [busy, setBusy] = React.useState(false)

  async function exportPDF() {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) {
      alert("Section not found")
      return
    }
    setBusy(true)
    try {
      // Lazy-load the export libraries — together ~570 KiB. Loaded
      // only when the user clicks Export PDF, then cached by the
      // browser for the rest of the session.
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
      const w = canvas.width * ratio
      const h = canvas.height * ratio
      pdf.addImage(imgData, "PNG", (pageWidth - w) / 2, 20, w, h)
      pdf.save(filename)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" className="bg-transparent" onClick={exportPDF} disabled={busy}>
      {busy ? "Generating…" : "Export PDF"}
    </Button>
  )
}
