"use client"

import { Button } from "@/src/components/ui/button"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export function ExportCSVButton<T extends Record<string, any>>({
  data,
  filename = "export.csv",
}: {
  data: T[]
  filename?: string
}) {
  function toCSV(rows: T[]) {
    if (rows.length === 0) return ""
    const headers = Object.keys(rows[0])
    const escape = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`
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
  async function exportPDF() {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) return alert("Section not found")
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
  }

  return (
    <Button variant="outline" className="bg-transparent" onClick={exportPDF}>
      Export PDF
    </Button>
  )
}
