"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function ProfileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Profile & Account</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Inventory Viewer" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue="you@company.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="org">Organization</Label>
            <Input id="org" defaultValue="Acme Inc." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button>Save</Button>
            <Button variant="outline" className="bg-transparent">
              Sign out
            </Button>
          </div>

          <div className="pt-4 text-sm">
            <p className="mb-2 font-medium">Quick Links</p>
            <div className="flex flex-col gap-2">
              <Link href="/settings/users" className="text-muted-foreground hover:text-foreground">
                Users & Roles
              </Link>
              <Link href="/settings/preferences" className="text-muted-foreground hover:text-foreground">
                Preferences
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
