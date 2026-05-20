import type * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.LabelHTMLAttributes<HTMLLabelElement> & {
  /** Adds a red required marker after the label text. */
  required?: boolean
}

export function Label({ className, required, children, ...props }: Props) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground/90", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  )
}
