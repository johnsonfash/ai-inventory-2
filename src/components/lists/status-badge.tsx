import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusTone = "success" | "warning" | "danger" | "info" | "brand" | "neutral"

const toneClasses: Record<StatusTone, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-500/20",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-500/20",
  brand: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary ring-1 ring-inset ring-brand/15 dark:ring-primary/20",
  neutral: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
}

type Props = {
  tone?: StatusTone
  /** Optional leading dot for status-rail look. */
  withDot?: boolean
  className?: string
  children: React.ReactNode
}

// Compact, semantically-colored status pill. Use for order status,
// stock state, payment status, etc. Tones are CSS-var driven so dark
// mode is automatic.
export function StatusBadge({ tone = "neutral", withDot, className, children }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize tracking-tight",
        toneClasses[tone],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-emerald-500",
            tone === "warning" && "bg-amber-500",
            tone === "danger" && "bg-rose-500",
            tone === "info" && "bg-sky-500",
            tone === "brand" && "bg-brand dark:bg-primary",
            tone === "neutral" && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  )
}
