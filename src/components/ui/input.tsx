import * as React from "react"
import { cn } from "@/lib/utils"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Marks the input as invalid (red border + ring). */
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
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
