import * as React from "react"
import { toast } from "sonner"
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/lists/empty-state"
import { StatusBadge } from "@/components/lists/status-badge"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"

type ApiKey = { id: string; name: string; prefix: string; scope: "read" | "read-write"; created: string; lastUsed: string }

const SEED: ApiKey[] = [
  { id: "k1", name: "Storefront sync", prefix: "pk_live_4f2a", scope: "read-write", created: "Mar 2, 2026", lastUsed: "2h ago" },
  { id: "k2", name: "Reporting export", prefix: "pk_live_91be", scope: "read", created: "Jan 18, 2026", lastUsed: "yesterday" },
]

// Random-ish mock token. Backend issues the real one; we only ever show
// the full value once, then store the masked prefix.
function genToken(): string {
  const r = () => Math.random().toString(36).slice(2, 10)
  return `pk_live_${r()}${r()}${r()}`
}

export default function ApiKeysSettings() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))
  const [keys, setKeys] = React.useState<ApiKey[]>(SEED)
  const [addOpen, setAddOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [scope, setScope] = React.useState<ApiKey["scope"]>("read")
  const [reveal, setReveal] = React.useState<{ name: string; token: string } | null>(null)

  const create = () => {
    if (!name.trim()) return
    const token = genToken()
    setKeys((prev) => [
      { id: `k-${Date.now()}`, name: name.trim(), prefix: token.slice(0, 12), scope, created: "just now", lastUsed: "never" },
      ...prev,
    ])
    setReveal({ name: name.trim(), token })
    setName("")
    setScope("read")
    setAddOpen(false)
  }

  const revoke = (k: ApiKey) => {
    setKeys((prev) => prev.filter((x) => x.id !== k.id))
    toast(`${k.name} revoked`, {
      description: "Any client using this key will get 401s.",
      action: { label: "Undo", onClick: () => setKeys((prev) => [k, ...prev]) },
    })
  }

  return (
    <PageShell
      title="API keys"
      withToolbar={false}
      titleTooltip="Programmatic access to your Pallio data. Use a read key for reporting/exports, a read-write key for two-way sync. Keys are shown in full once, then masked — treat them like passwords."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">REST API at <code className="rounded bg-muted px-1.5 py-0.5 text-xs">api.pallio.app/v1</code></p>
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> New key</Button>
        </div>

        {keys.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState Icon={KeyRound} title="No API keys yet" description="Create a key to connect Pallio to your own scripts or services." action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> New key</Button>} />
          </CardContent></Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{k.name}</p>
                    <StatusBadge tone={k.scope === "read-write" ? "warning" : "info"}>{k.scope}</StatusBadge>
                  </div>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{k.prefix}··········· · created {k.created} · used {k.lastUsed}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => revoke(k)} aria-label="Revoke key" className="text-rose-600 hover:bg-rose-500/10 dark:text-rose-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create */}
      <BottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New API key"
        description="Name it and pick a scope. The full key shows once on the next screen."
        footer={
          <div className="flex items-center justify-end gap-2 pb-3">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={!name.trim()}>Create key</Button>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); create() }} className="flex flex-col gap-3 pb-1">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Key name</span>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Storefront sync" />
          </label>
          <div className="flex gap-2">
            {(["read", "read-write"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setScope(s)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${scope === s ? "border-brand bg-brand-soft text-brand dark:border-primary dark:bg-primary/15 dark:text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>
                {s === "read" ? "Read only" : "Read & write"}
              </button>
            ))}
          </div>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>
      </BottomSheet>

      {/* Reveal once */}
      <BottomSheet
        open={reveal !== null}
        onClose={() => setReveal(null)}
        title="Copy your API key now"
        description="This is the only time the full key is shown. Store it somewhere safe."
        footer={<div className="flex justify-end pb-3"><Button onClick={() => setReveal(null)}>Done</Button></div>}
      >
        {reveal && (
          <div className="pb-1">
            <p className="text-xs font-semibold text-foreground/80">{reveal.name}</p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs">{reveal.token}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(reveal.token); toast.success("Copied to clipboard") }}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </PageShell>
  )
}
