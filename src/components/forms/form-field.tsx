import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  /** Field label. Pass `null` to omit. */
  label?: React.ReactNode
  /** Helper text under the input. Hidden if `error` is set. */
  hint?: React.ReactNode
  /** Validation error message — shows red. */
  error?: React.ReactNode
  /** Marks as required (adds red `*` to label). */
  required?: boolean
  /** ID linking the label to the input. */
  htmlFor?: string
  /** Span N columns inside a FormGrid (md+). */
  span?: 1 | 2 | 3
  className?: string
  children: React.ReactNode
}

// Standardised label + input + helper/error stack. Use inside <FormGrid>.
export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  span,
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        span === 2 && "md:col-span-2",
        span === 3 && "md:col-span-3",
        className,
      )}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
