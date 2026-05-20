import * as React from "react"
import { Link } from "react-router-dom"
import { Crown, MoreHorizontal, Plus, Search, Shield, ShieldCheck, UserCog, Users } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"

type Role = "Admin" | "Manager" | "Cashier" | "Viewer"
type Row = {
  email: string
  name: string
  role: Role
  location: string
  status: "active" | "invited" | "suspended"
  lastSeen: string
}

const rows: Row[] = [
  { email: "john@pallio.app", name: "John Founder", role: "Admin", location: "HQ", status: "active", lastSeen: "Active now" },
  { email: "mia@pallio.app", name: "Mia Chen", role: "Manager", location: "Downtown Austin", status: "active", lastSeen: "12m ago" },
  { email: "alex@pallio.app", name: "Alex Larson", role: "Manager", location: "East DC", status: "active", lastSeen: "2h ago" },
  { email: "priya@pallio.app", name: "Priya Patel", role: "Cashier", location: "West Hub", status: "active", lastSeen: "1d ago" },
  { email: "daniel@pallio.app", name: "Daniel Kim", role: "Cashier", location: "HQ", status: "invited", lastSeen: "Pending invite" },
  { email: "linda@pallio.app", name: "Linda Mensah", role: "Viewer", location: "HQ", status: "suspended", lastSeen: "30d ago" },
]

const roleIcon: Record<Role, typeof Crown> = {
  Admin: Crown,
  Manager: Shield,
  Cashier: UserCog,
  Viewer: ShieldCheck,
}
const roleTone: Record<Role, StatusTone> = {
  Admin: "brand",
  Manager: "info",
  Cashier: "warning",
  Viewer: "neutral",
}
const statusTone: Record<Row["status"], StatusTone> = {
  active: "success",
  invited: "warning",
  suspended: "danger",
}

function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("")
}

function avatarTint(name: string) {
  const palette = [
    "bg-brand/15 text-brand dark:bg-primary/20 dark:text-primary",
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]!
}

export default function UsersSettings() {
  const isMobile = useIsMobile()
  const [query, setQuery] = React.useState("")

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
  }, [query])

  const active = rows.filter((r) => r.status === "active").length
  const invited = rows.filter((r) => r.status === "invited").length
  const admins = rows.filter((r) => r.role === "Admin").length

  return (
    <PageShell title="Users" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Users", value: String(rows.length), tone: "brand", hint: "in workspace" },
            { label: "Active", value: String(active), tone: "success", hint: "signed in" },
            { label: "Invited", value: String(invited), tone: "warning", hint: "not accepted" },
            { label: "Admins", value: String(admins), tone: "info", hint: "elevated" },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
          </div>
          <Link to="/settings/users/new" className="inline-flex">
            <Button><Plus className="h-4 w-4" /> Invite user</Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={Users} title="No users match" description="Try a different name or email." />
          </CardContent></Card>
        ) : isMobile ? (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const RIcon = roleIcon[r.role]
              return (
                <li key={r.email} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarTint(r.name)}`}>
                    {initialsOf(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <StatusBadge tone={statusTone[r.status]}>{r.status}</StatusBadge>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{r.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <StatusBadge tone={roleTone[r.role]}><RIcon className="h-3 w-3" /> {r.role}</StatusBadge>
                      <span className="text-[10px] text-muted-foreground">· {r.location}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{r.lastSeen}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">User</th>
                  <th className="px-3 py-2.5 font-medium">Email</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Last seen</th>
                  <th className="px-3 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const RIcon = roleIcon[r.role]
                  return (
                    <tr key={r.email} className="transition-colors hover:bg-accent/30">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${avatarTint(r.name)}`}>{initialsOf(r.name)}</span>
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.email}</td>
                      <td className="px-3 py-2.5"><StatusBadge tone={roleTone[r.role]}><RIcon className="h-3 w-3" /> {r.role}</StatusBadge></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.location}</td>
                      <td className="px-3 py-2.5"><StatusBadge tone={statusTone[r.status]} withDot>{r.status}</StatusBadge></td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.lastSeen}</td>
                      <td className="px-3 py-2.5 text-right">
                        <Button size="sm" variant="ghost" aria-label="More actions"><MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}
