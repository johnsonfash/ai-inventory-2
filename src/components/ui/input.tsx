import * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Marks the input as invalid (red border + ring). */
  error?: boolean
}

// Mobile-friendly numeric defaults applied automatically whenever
// `type="number"` is used:
//
// - `inputMode="decimal"` so phones surface the number pad instead of
//   the alpha keyboard. Caller can override (e.g. `inputMode="numeric"`
//   for integer-only fields) by passing the prop explicitly.
// - `onFocus` selects the existing value so the user can clear / replace
//   the entire field with a single keystroke. Easier than reaching for
//   backspace, especially on mobile. Caller's own `onFocus` runs after.
// - Native spinner buttons are hidden globally via index.css.
export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, type, inputMode, onFocus, ...props },
  ref,
) {
  const isNumber = type === "number"
  const resolvedInputMode = inputMode ?? (isNumber ? "decimal" : undefined)
  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (isNumber) e.currentTarget.select()
      onFocus?.(e)
    },
    [isNumber, onFocus],
  )

  return (
    <input
      ref={ref}
      type={type}
      inputMode={resolvedInputMode}
      onFocus={handleFocus}
      aria-invalid={error || undefined}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:cursor-not-allowed disabled:opacity-60",
        error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30",
        className,
      )}
      {...props}
    />
  )
})
