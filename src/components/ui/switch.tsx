import type * as React from "react"
import { cn } from "@/src/lib/utils"

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { id?: string }

export function Switch({ className, ...props }: Props) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        className={cn("relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-violet-600", className)}
      >
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  )
}
