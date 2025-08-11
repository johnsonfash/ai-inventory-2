"use client"

import * as React from "react"
import { cn } from "@/src/lib/utils"

type DialogCtx = { open: boolean; onOpenChange?: (v: boolean) => void }
const Ctx = React.createContext<DialogCtx | null>(null)

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange?: (v: boolean) => void
  children: React.ReactNode
}) {
  return <Ctx.Provider value={{ open, onOpenChange }}>{children}</Ctx.Provider>
}

export function DialogTrigger({ asChild = false, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(Ctx)!
  const child = React.Children.only(children)
  const onClick = (e: any) => {
    child.props.onClick?.(e)
    ctx.onOpenChange?.(true)
  }
  return React.cloneElement(child, { onClick })
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(Ctx)!
  if (!ctx.open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => ctx.onOpenChange?.(false)} />
      <div className={cn("relative z-10 w-[95vw] max-w-lg rounded-lg border bg-background p-4 shadow-lg", className)}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-2", className)} {...props} />
}
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-3 flex justify-end gap-2", className)} {...props} />
}
