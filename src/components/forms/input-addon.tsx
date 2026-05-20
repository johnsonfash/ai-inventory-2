import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  /** Text or icon shown attached to the left of the input. */
  leading?: React.ReactNode
  /** Text or icon shown attached to the right of the input. */
  trailing?: React.ReactNode
  /** Apply error styling to the wrapper border too. */
  error?: boolean
  className?: string
  children: React.ReactNode
}

// Wraps an Input so a leading/trailing addon (like "$" or "USD" or an
// icon) sits flush against it. The addon segments inherit the input
// border so the whole control reads as one field.
export function InputAddon({ leading, trailing, error, className, children }: Props) {
  return (
    <div
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background shadow-sm transition-colors",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
        error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
        className,
      )}
    >
      {leading && (
        <span className="inline-flex items-center border-r border-input bg-muted/40 px-3 text-sm text-muted-foreground">
          {leading}
        </span>
      )}
      {/* Inject `border-0` + `bg-transparent` onto the inner input. */}
      <div className="flex-1 [&>input]:h-full [&>input]:w-full [&>input]:rounded-none [&>input]:border-0 [&>input]:bg-transparent [&>input]:px-3 [&>input]:text-sm [&>input]:outline-none [&>input]:focus-visible:ring-0">
        {children}
      </div>
      {trailing && (
        <span className="inline-flex items-center border-l border-input bg-muted/40 px-3 text-sm text-muted-foreground">
          {trailing}
        </span>
      )}
    </div>
  )
}
