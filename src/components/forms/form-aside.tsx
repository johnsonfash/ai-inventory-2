import type * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Tip = { title: string; body: React.ReactNode; Icon?: LucideIcon }

type Props = {
  title?: string
  tips?: Tip[]
  /** Custom content if tips don't fit the use case. */
  children?: React.ReactNode
  className?: string
}

// Right-column helper panel used in FormShell's `aside`. Renders a
// title + list of tip cards, OR custom children. Hidden on mobile by
// the parent (`hidden lg:block` on the aside slot).
export function FormAside({ title = "Tips", tips, children, className }: Props) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-muted/30 p-4", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children ? (
        <div className="mt-3">{children}</div>
      ) : (
        <ul className="mt-3 space-y-3">
          {(tips ?? []).map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              {t.Icon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <t.Icon className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold">{t.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
