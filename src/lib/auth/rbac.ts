"use client"

export type Role = "Admin" | "Manager" | "Sales" | "Marketing" | "Viewer"
export type Permission =
  | "view:team"
  | "view:team:detail"
  | "edit:roles"
  | "edit:users"
  | "view:commissions"
  | "view:inventory"
  | "pos:charge"
  | "pos:refund"

export const RolePermissions: Record<Role, Permission[]> = {
  Admin: [
    "view:team",
    "view:team:detail",
    "edit:roles",
    "edit:users",
    "view:commissions",
    "view:inventory",
    "pos:charge",
    "pos:refund",
  ],
  Manager: ["view:team", "view:team:detail", "view:commissions", "view:inventory", "pos:charge", "pos:refund"],
  Sales: ["view:team", "view:inventory", "pos:charge"],
  Marketing: ["view:commissions", "view:team"],
  Viewer: ["view:team", "view:inventory"],
}

export function hasPermission(role: Role, perm: Permission) {
  return RolePermissions[role]?.includes(perm) ?? false
}
