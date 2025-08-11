"use client"

import type * as React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { OrgLocationSwitch } from "@/components/org-location-switch"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

type PageShellProps = {
  title: string
  children: React.ReactNode
  withToolbar?: boolean
}

export function PageShell({ title, children, withToolbar = true }: PageShellProps) {
  return (
    <div className="flex h-svh overflow-hidden">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/60 px-4 backdrop-blur">
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <OrgLocationSwitch />
            <div className="hidden md:block">
              <Input placeholder="Search items, orders..." className="w-[260px]" />
            </div>
            <ModeToggle />
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              IV
            </div>
          </div>
        </header>

        {withToolbar && (
          <div className="border-b bg-gradient-to-r from-violet-50/60 to-emerald-50/60 p-3 dark:from-violet-950/20 dark:to-emerald-950/20">
            <div className="flex flex-wrap items-center gap-2 px-1">
              <Link href="/inventory/new" className="inline-flex">
                <Button>New Item</Button>
              </Link>
              <Link href="/purchasing/pos/new" className="inline-flex">
                <Button variant="outline">Create Purchase Order</Button>
              </Link>
              <Link href="/inventory/receive" className="inline-flex">
                <Button variant="outline">Receive Stock</Button>
              </Link>
              <Link href="/notifications" className="ml-2 inline-flex">
                <Button variant="outline">Notifications</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
