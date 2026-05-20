import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { EmptyState } from "@/components/lists/empty-state"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { ConnectModal } from "@/components/integrations/connect-modal"
import {
  PROVIDERS,
  getConnections,
  getStatus,
} from "@/lib/integrations/data"
import type {
  IntegrationCategory,
  IntegrationProvider,
  IntegrationStatus,
} from "@/lib/integrations/types"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  payments: "Payments",
  commerce: "Commerce",
  comms: "Comms",
  team: "Team",
  analytics: "Analytics",
}

const STATUS_TONE: Record<IntegrationStatus, StatusTone> = {
  disconnected: "neutral",
  connected: "success",
  pending: "warning",
  error: "danger",
}

const STATUS_ICON: Record<IntegrationStatus, React.ElementType> = {
  disconnected: Plus,
  connected: CheckCircle2,
  pending: Sparkles,
  error: XCircle,
}

export default function IntegrationsHub() {
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))

  const [category, setCategory] = React.useState<"all" | IntegrationCategory>("all")
  const [query, setQuery] = React.useState("")
  const [connectOpen, setConnectOpen] = React.useState(false)
  const [activeProvider, setActiveProvider] = React.useState<IntegrationProvider | null>(null)
  // Bumped on connect/disconnect so the kv reread re-renders cards.
  const [version, setVersion] = React.useState(0)

  const connections = React.useMemo(() => getConnections(), [version])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return PROVIDERS
      .filter((p) => category === "all" || p.category === category)
      .filter((p) =>
        !q
          ? true
          : p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q),
      )
  }, [category, query])

  const byCategoryCount: Record<IntegrationCategory, number> = {
    payments: 0, commerce: 0, comms: 0, team: 0, analytics: 0,
  }
  for (const p of PROVIDERS) byCategoryCount[p.category]++

  const connectedCount = Object.values(connections).filter((c) => c.status === "connected").length

  const openConnect = (provider: IntegrationProvider) => {
    setActiveProvider(provider)
    setConnectOpen(true)
  }

  return (
    <PageShell title="Integrations" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <SummaryStrip
          tiles={[
            { label: "Available",  value: String(PROVIDERS.length),   tone: "brand",   hint: "across 5 categories" },
            { label: "Connected",  value: String(connectedCount),     tone: "success", hint: "active" },
            { label: "Payments",   value: String(byCategoryCount.payments), tone: "info", hint: "rails" },
            { label: "Channels",   value: String(byCategoryCount.comms + byCategoryCount.team), tone: "warning", hint: "comms + team" },
          ]}
        />

        {/* Category tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {(["all", "payments", "commerce", "comms", "team", "analytics"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                  category === c
                    ? "border-transparent bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {c === "all" ? "All" : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search integrations…"
              className="pl-9"
            />
          </div>
        </div>

        {/* Provider grid */}
        {filtered.length === 0 ? (
          <EmptyState
            Icon={ShieldCheck}
            title="No matches"
            description="Try a different category or search."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <li key={p.id}>
                <ProviderCard
                  provider={p}
                  status={getStatus(p.id) as IntegrationStatus}
                  onConnect={() => openConnect(p)}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Help box */}
        <div className="flex items-start gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Need an integration that isn't here? <Link to="/contact" className="font-semibold text-brand hover:underline dark:text-primary">Tell us</Link> what you use — we ship a new one every other week.
          </p>
        </div>
      </div>

      <ConnectModal
        open={connectOpen}
        provider={activeProvider}
        onClose={() => setConnectOpen(false)}
        onConnected={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  )
}

function ProviderCard({
  provider,
  status,
  onConnect,
}: {
  provider: IntegrationProvider
  status: IntegrationStatus
  onConnect: () => void
}) {
  const connected = status === "connected"
  const StatusIcon = STATUS_ICON[status]
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
      <header className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
          style={{ background: provider.brand }}
        >
          {provider.letter}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold">{provider.name}</p>
            {provider.tag && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  provider.tag.tone === "brand" && "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary",
                  provider.tag.tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                  provider.tag.tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                  provider.tag.tone === "info" && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                )}
              >
                {provider.tag.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABEL[provider.category]}
          </p>
        </div>
      </header>

      <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
        {provider.tagline}
      </p>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <StatusBadge tone={STATUS_TONE[status]} withDot>
          <StatusIcon className="h-2.5 w-2.5" />
          {status}
        </StatusBadge>
        {connected ? (
          <Link to={`/settings/integrations/${provider.id}`}>
            <Button size="sm" variant="outline">
              Manage <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Button size="sm" onClick={onConnect}>
            Connect <Plus className="h-3 w-3" />
          </Button>
        )}
      </footer>
    </article>
  )
}
