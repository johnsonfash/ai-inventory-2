import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  description?: string
  /** Small icon next to the title (matches the section's theme tone). */
  Icon?: LucideIcon
  /** Right-aligned chip / hint shown in the header. */
  trailing?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// Sectioned panel inside a form. Title + optional description in a
// soft-bordered card, then the fields stack inside.
export function FormSection({ title, description, Icon, trailing, className, children }: Props) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card", className)}>
      <header className="flex items-start gap-3 border-b border-border px-4 py-3 md:px-5 md:py-4">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight md:text-base">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{description}</p>
          )}
        </div>
        {trailing}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}
