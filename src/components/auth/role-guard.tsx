"use client"

import * as React from "react"
import { currentUser, initAuthDemo } from "@/src/lib/auth/store"
import { hasPermission, type Permission } from "@/src/lib/auth/rbac"

export function RoleGuard({
  permission,
  children,
  fallback,
}: {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  React.useEffect(() => {
    initAuthDemo()
  }, [])
  const user = currentUser()
  const allowed = user ? hasPermission(user.role, permission) : false
  if (!allowed) {
    return (
      fallback ?? (
        <div className="mx-auto my-10 max-w-xl rounded border p-4 text-sm">
          <div className="font-semibold">Access denied</div>
          <div className="text-muted-foreground">You don&apos;t have permission to view this page.</div>
        </div>
      )
    )
  }
  return <>{children}</>
}
