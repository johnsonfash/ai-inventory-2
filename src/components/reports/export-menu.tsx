import * as React from "react"
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"

type Props = {
  /** Filename stem used for downloaded files (no extension). */
  filename: string
  /** Rows for CSV. Headers come from object keys of the first row. */
  rows?: Record<string, string | number | null | undefined>[]
  /** Optional custom CSV headers (and their order). Defaults to keys
      of the first row. */
  headers?: string[]
  /** Called before window.print() so the caller can stash state. */
  onPrint?: () => void
  /** Hidden when no rows AND no print handler — there's nothing to do. */
  className?: string
}

// Compact "Export" dropdown with CSV, PDF, and Print actions.
// PDF uses `window.print()` against a print-targeted CSS class
// (handled by the caller). The CSV pathway escapes values + handles
// commas / quotes / newlines safely.
export function ExportMenu({ filename, rows, onPrint, headers, className }: Props) {
  const downloadCsv = () => {
    if (!rows || rows.length === 0) return
    const keys = headers ?? Object.keys(rows[0]!)
    const header = keys.map(csvCell).join(",")
    const body = rows.map((r) => keys.map((k) => csvCell(r[k] ?? "")).join(",")).join("\n")
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const triggerPrint = () => {
    onPrint?.()
    requestAnimationFrame(() => window.print())
  }

  return (
    <Dropdown
      className={className}
      button={
        <>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </>
      }
    >
      {rows && rows.length > 0 && (
        <DropdownItem onSelect={downloadCsv}>
          <FileSpreadsheet className="h-4 w-4" /> Download CSV
        </DropdownItem>
      )}
      <DropdownItem onSelect={triggerPrint}>
        <Printer className="h-4 w-4" /> Print
      </DropdownItem>
      <DropdownItem onSelect={triggerPrint}>
        <FileText className="h-4 w-4" /> Save as PDF
      </DropdownItem>
    </Dropdown>
  )
}

function csvCell(v: unknown): string {
  if (v == null) return ""
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
