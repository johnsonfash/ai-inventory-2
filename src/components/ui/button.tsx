import * as React from "react"
import { cn } from "@/lib/utils"

const variantClasses = {
  default: "bg-violet-600 text-white hover:bg-violet-600/90",
  outline: "border bg-transparent hover:bg-accent",
  ghost: "bg-transparent hover:bg-accent",
  secondary: "bg-muted text-foreground hover:bg-muted/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
} as const

const sizeClasses = {
  default: "h-9 px-3",
  sm: "h-8 px-2",
  lg: "h-10 px-4",
  icon: "h-9 w-9 p-0",
} as const

type Variant = keyof typeof variantClasses
type Size = keyof typeof sizeClasses

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

export function buttonVariants(opts?: { variant?: Variant; size?: Size; className?: string }) {
  const { variant = "default", size = "default", className } = opts ?? {}
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", asChild = false, children, ...props },
  ref,
) {
  const classes = buttonVariants({ variant, size, className })
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      ...props,
      className: cn(classes, child.props.className),
    } as React.HTMLAttributes<HTMLElement>)
  }
  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  )
})
