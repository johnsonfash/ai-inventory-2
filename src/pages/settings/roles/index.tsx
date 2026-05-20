import * as React from "react"
import { Link } from "react-router-dom"
import { Check, Crown, Edit3, Plus, Shield, ShieldCheck, UserCog, X } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { cn } from "@/lib/utils"

type Role = "Admin" | "Manager" | "Cashier" | "Viewer"

const ROLES: Role[] = ["Admin", "Manager", "Cashier", "Viewer"]

const roleIcon: Record<Role, typeof Crown> = {
  Admin: Crown,
  Manager: Shield,
  Cashier: UserCog,
  Viewer: ShieldCheck,
}
const roleTone: Record<Role, StatusTone> = { Admin: "brand", Manager: "info", Cashier: "warning", Viewer: "neutral" }

type Permission = { key: string; group: string; description: string; allowed: Record<Role, boolean> }

const PERMISSIONS: Permission[] = [
  { key: "inventory.read", group: "Inventory", description: "View items, stock levels, and movements", allowed: { Admin: true, Manager: true, Cashier: true, Viewer: true } },
  { key: "inventory.write", group: "Inventory", description: "Create, edit, and adjust stock", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: false } },
  { key: "inventory.delete", group: "Inventory", description: "Permanently delete items", allowed: { Admin: true, Manager: false, Cashier: false, Viewer: false } },
  { key: "pos.use", group: "POS", description: "Run sales at the point of sale", allowed: { Admin: true, Manager: true, Cashier: true, Viewer: false } },
  { key: "pos.void", group: "POS", description: "Void / refund completed transactions", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: false } },
  { key: "purchasing.read", group: "Purchasing", description: "View POs, bills, and vendors", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: true } },
  { key: "purchasing.write", group: "Purchasing", description: "Create and edit purchase orders + bills", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: false } },
  { key: "reports.read", group: "Reports", description: "View any report", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: true } },
  { key: "reports.export", group: "Reports", description: "Export CSV / PDF", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: false } },
  { key: "settings.access", group: "Settings", description: "Open the Settings area", allowed: { Admin: true, Manager: true, Cashier: false, Viewer: false } },
  { key: "settings.users", group: "Settings", description: "Invite and manage users", allowed: { Admin: true, Manager: false, Cashier: false, Viewer: false } },
  { key: "settings.billing", group: "Settings", description: "Connect payment processors and bank accounts", allowed: { Admin: true, Manager: false, Cashier: false, Viewer: false } },
]

const grouped = PERMISSIONS.reduce<Record<string, Permission[]>>((acc, p) => {
  (acc[p.group] ??= []).push(p)
  return acc
}, {})

export default function RolesSettings() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const userCount: Record<Role, number> = { Admin: 1, Manager: 3, Cashier: 4, Viewer: 2 }

  return (
    <PageShell title="Roles & permissions" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={ROLES.map((r): { label: string; value: string; tone: StatusTone; hint: string } => ({
            label: r,
            value: String(userCount[r]),
            tone: roleTone[r],
            hint: r === "Admin" ? "elevated" : r === "Manager" ? "lead" : r === "Cashier" ? "POS" : "read-only",
          }))}
        />

        {/* Role cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => {
            const Icon = roleIcon[r]
            const count = PERMISSIONS.filter((p) => p.allowed[r]).length
            return (
              <Link key={r} to="/settings/roles" className="group rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    r === "Admin" && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                    r === "Manager" && "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
                    r === "Cashier" && "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                    r === "Viewer" && "bg-muted text-muted-foreground",
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r}</p>
                    <p className="text-[11px] text-muted-foreground">{userCount[r]} users · {count} permissions</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Permission matrix */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 md:px-5 md:py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold md:text-base">Permission matrix</p>
              <p className="text-[11px] text-muted-foreground md:text-sm">Edit which capabilities each role grants.</p>
            </div>
            <Link to="/settings/roles/new"><Button size="sm"><Plus className="h-3.5 w-3.5" /> New role</Button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-3 py-2.5 text-center font-medium">{r}</th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([group, perms], gi) => (
                  <React.Fragment key={group}>
                    <tr>
                      <td colSpan={ROLES.length + 2} className={cn(
                        "px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                        gi > 0 && "border-t border-border",
                      )}>{group}</td>
                    </tr>
                    {perms.map((p) => (
                      <tr key={p.key} className="border-t border-border transition-colors hover:bg-accent/20">
                        <td className="px-3 py-2.5">
                          <p className="font-medium">{p.description}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{p.key}</p>
                        </td>
                        {ROLES.map((r) => (
                          <td key={r} className="px-3 py-2.5 text-center">
                            {p.allowed[r] ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"><Check className="h-3 w-3" /></span>
                            ) : (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground"><X className="h-3 w-3" /></span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-right">
                          <Button size="sm" variant="ghost"><Edit3 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
