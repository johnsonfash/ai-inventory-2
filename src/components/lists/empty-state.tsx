import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  Icon: LucideIcon
  title: string
  description?: string
  /** Right-aligned action node — usually a <Button> or Link. */
  action?: React.ReactNode
  /** Compact variant for inside cards / list panels. */
  size?: "sm" | "default"
  className?: string
}

// Reusable empty state with a soft gradient icon background.
export function EmptyState({ Icon, title, description, action, size = "default", className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        size === "default" ? "py-12 px-6" : "py-8 px-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-brand-soft/0 text-brand dark:from-primary/20 dark:to-primary/0 dark:text-primary",
          size === "default" ? "h-14 w-14" : "h-10 w-10",
        )}
      >
        <Icon className={size === "default" ? "h-6 w-6" : "h-5 w-5"} strokeWidth={1.8} />
      </span>
      <div className="space-y-1">
        <h3 className={cn("font-semibold tracking-tight", size === "default" ? "text-base" : "text-sm")}>{title}</h3>
        {description && (
          <p className={cn("max-w-sm text-muted-foreground", size === "default" ? "text-sm" : "text-xs")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
