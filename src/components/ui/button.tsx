import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    default: "bg-violet-600 text-white hover:bg-violet-600/90",
    outline: "border bg-transparent hover:bg-accent",
    ghost: "bg-transparent hover:bg-accent",
  }
  const sizes = {
    default: "h-9 px-3",
    sm: "h-8 px-2",
    icon: "h-9 w-9 p-0",
  }
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
})
