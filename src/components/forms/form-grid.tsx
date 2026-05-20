import type * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  /** Columns on md+. Mobile is always 1-col. Defaults to 2. */
  cols?: 1 | 2 | 3
  className?: string
  children: React.ReactNode
}

// Responsive grid for stacking form fields. Mobile is always one
// column; md+ goes to the requested number of columns.
export function FormGrid({ cols = 2, className, children }: Props) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "md:grid-cols-1",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  )
}
