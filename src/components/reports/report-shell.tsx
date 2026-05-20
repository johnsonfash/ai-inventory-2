import * as React from "react"
import { PageShell } from "@/components/page-shell"
import { PeriodChips, type Period } from "@/components/reports/period-chips"
import { ExportMenu } from "@/components/reports/export-menu"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  /** Short subtitle shown under the page title on the report header. */
  description?: string
  period: Period
  onPeriodChange: (p: Period) => void
  /** Filename stem for CSV/PDF export. */
  exportFilename: string
  /** Rows for CSV export. Omit to hide the CSV action. */
  exportRows?: Record<string, string | number | null | undefined>[]
  exportHeaders?: string[]
  children: React.ReactNode
}

// Common report layout. Header row with title + description + period
// chips + export menu. Page content slot below. Wraps PageShell so
// pull-to-refresh + bottom nav still work on mobile.
export function ReportShell({
  title,
  description,
  period,
  onPeriodChange,
  exportFilename,
  exportRows,
  exportHeaders,
  children,
}: Props) {
  return (
    <PageShell
      title={title}
      withToolbar={false}
      mobileTrailing={
        <ExportMenu
          filename={exportFilename}
          rows={exportRows}
          headers={exportHeaders}
          shareTitle={title}
        />
      }
    >
      <div className="flex flex-col gap-4 print:gap-3">
        {/* Report header (hidden when only the print slot is visible) */}
        <header className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className={cn("text-lg font-bold tracking-tight md:text-xl print:text-2xl")}>{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <div className="hidden md:block">
              <ExportMenu filename={exportFilename} rows={exportRows} headers={exportHeaders} shareTitle={title} />
            </div>
          </div>
          <div className="print:hidden">
            <PeriodChips value={period} onChange={onPeriodChange} />
          </div>
        </header>

        {children}
      </div>
    </PageShell>
  )
}
