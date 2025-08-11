import type * as React from "react"
import { cn } from "@/src/lib/utils"

type Props = React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" }

export function Badge({ className, variant = "default", ...props }: Props) {
  const variants = {
    default: "bg-violet-600 text-white",
    secondary: "bg-muted text-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
