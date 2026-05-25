
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
  // Approve a gated till action (deep discount, high-value void, manager
  // override). Held by Admin + Manager. POS-1 checks this when wiring the
  // backend; today the till verifies a shared PIN (see lib/pos/settings).
  | "pos:override"

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
    "pos:override",
  ],
  Manager: ["view:team", "view:team:detail", "view:commissions", "view:inventory", "pos:charge", "pos:refund", "pos:override"],
  Sales: ["view:team", "view:inventory", "pos:charge"],
  Marketing: ["view:commissions", "view:team"],
  Viewer: ["view:team", "view:inventory"],
}

export function hasPermission(role: Role, perm: Permission) {
  return RolePermissions[role]?.includes(perm) ?? false
}
