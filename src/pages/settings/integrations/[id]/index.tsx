import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  RotateCcw,
  ShieldCheck,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { EmptyState } from "@/components/lists/empty-state"
import { InfoTooltip } from "@/components/info-tooltip"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import {
  disconnectProvider,
  getConnection,
  getProvider,
  recordTest,
} from "@/lib/integrations/data"
import type {
  IntegrationConnection,
  IntegrationStatus,
} from "@/lib/integrations/types"
import { cn } from "@/lib/utils"

const STATUS_TONE: Record<IntegrationStatus, StatusTone> = {
  disconnected: "neutral",
  connected: "success",
  pending: "warning",
  error: "danger",
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d === 1 ? "1d ago" : `${d}d ago`
}

export default function IntegrationDetail() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const provider = getProvider(params.id ?? "")
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 300)) }, []))

  const [version, setVersion] = React.useState(0)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [testing, setTesting] = React.useState(false)
  const connection = React.useMemo<IntegrationConnection | undefined>(
    () => (provider ? getConnection(provider.id) : undefined),
    [provider, version],
  )

  if (!provider) {
    return (
      <PageShell title="Integration" withToolbar={false}>
        <Card>
          <CardContent>
            <EmptyState
              Icon={ShieldCheck}
              title="Integration not found"
              description="That provider isn't in our registry."
              action={<Link to="/settings/integrations"><Button>Back to integrations</Button></Link>}
            />
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  if (!connection) {
    return (
      <PageShell title={provider.name} withToolbar={false}>
        <div className="flex flex-col gap-4">
          <Link to="/settings/integrations" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All integrations
          </Link>
          <Card>
            <CardContent>
              <EmptyState
                Icon={Lock}
                title={`${provider.name} isn't connected`}
                description="Connect it from the integrations hub to manage settings here."
                action={<Link to="/settings/integrations"><Button>Connect {provider.name}</Button></Link>}
              />
            </CardContent>
          </Card>
        </div>
      </PageShell>
    )
  }

  const webhookUrl = `https://api.pallio.app/hooks/${provider.id}`

  const doTest = async () => {
    setTesting(true)
    await new Promise((r) => setTimeout(r, 700))
    await recordTest(provider.id, true)
    setTesting(false)
    setVersion((v) => v + 1)
    toast.success("Test request returned 200.")
  }

  const doDisconnect = async () => {
    await disconnectProvider(provider.id)
    setConfirmOpen(false)
    toast.success(`${provider.name} disconnected.`)
    navigate("/settings/integrations")
  }

  const copy = async (val: string, label: string) => {
    try {
      await navigator.clipboard.writeText(val)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Couldn't copy")
    }
  }

  return (
    <PageShell title={provider.name} withToolbar={false}>
      <div className="flex flex-col gap-4">
        <Link to="/settings/integrations" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All integrations
        </Link>

        {/* Hero — provider brand banner */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border p-5"
          style={{ background: `linear-gradient(135deg, ${provider.brand}26, transparent 75%)` }}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl"
            style={{ background: `${provider.brand}55` }}
            aria-hidden
          />
          <div className="relative flex flex-wrap items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
              style={{ background: provider.brand }}
            >
              {provider.letter}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{provider.name}</h2>
                <StatusBadge tone={STATUS_TONE[connection.status]} withDot>
                  <CheckCircle2 className="h-2.5 w-2.5" /> {connection.status}
                </StatusBadge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{provider.tagline}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Connected {relTime(connection.connectedAt)} · {provider.fields.filter((f) => f.required).length} credential{provider.fields.filter((f) => f.required).length === 1 ? "" : "s"} stored
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={doTest} disabled={testing}>
                <Zap className="h-3.5 w-3.5" /> {testing ? "Testing…" : "Test"}
              </Button>
              {provider.docsUrl && (
                <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3.5 w-3.5" /> Docs
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 2-col layout: stored credentials + webhook | event log */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            {/* Stored credentials */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm font-semibold md:text-base">Stored credentials</h3>
                <InfoTooltip label="Stored credentials" size="xs">
                  Pallio stores the secret encrypted server-side (or in your encrypted local keystore on native). We display the last 4 characters here as a hint; the full value is never reloaded into the browser.
                </InfoTooltip>
              </div>
              <p className="text-[11px] text-muted-foreground">Reveal-by-default is off; rotate via the provider's dashboard then re-connect.</p>

              <ul className="mt-4 flex flex-col gap-2">
                {provider.fields.map((f) => {
                  const masked = connection.fieldsMasked[f.key]
                  return (
                    <li key={f.key} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{f.label}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{masked ?? "—"}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* Webhook */}
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm font-semibold md:text-base">Webhook URL</h3>
                <InfoTooltip label="Webhook" size="xs">
                  Paste this into the {provider.name} dashboard so Pallio can receive payment / refund / status events from them.
                </InfoTooltip>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
                <code className="flex-1 truncate font-mono text-xs">{webhookUrl}</code>
                <Button size="sm" variant="ghost" onClick={() => copy(webhookUrl, "Webhook URL")}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Outgoing requests are signed with HMAC-SHA256. Verify the signature header in production.
              </p>
            </section>
          </div>

          {/* Event log */}
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-sm font-semibold md:text-base">Event log</h3>
              <InfoTooltip label="Event log" size="xs">
                Connection + test + disconnect events. Full webhook traffic logs land with the real backend.
              </InfoTooltip>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {[...connection.events].reverse().map((e, i) => {
                const Icon = e.kind === "error" ? XCircle : e.kind === "test" ? Zap : e.kind === "disconnected" ? RotateCcw : CheckCircle2
                const tone =
                  e.kind === "error" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300" :
                  e.kind === "test" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                  e.kind === "disconnected" ? "bg-muted text-muted-foreground" :
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tone)}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-tight">{e.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{relTime(e.at)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* Danger zone */}
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
          <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">Disconnect</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Removes credentials + stops Pallio from sending or receiving events for this provider. Any in-flight reconciliations from {provider.name} get paused until you reconnect.
          </p>
          {!confirmOpen ? (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-rose-500/40 text-rose-600 dark:text-rose-400"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Disconnect {provider.name}
            </Button>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="flex-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                Sure? You'll need to re-paste the keys to reconnect.
              </p>
              <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={doDisconnect} className="bg-rose-600 text-white hover:bg-rose-600/90 dark:bg-rose-700 dark:hover:bg-rose-700/90">
                <Trash2 className="h-3.5 w-3.5" /> Yes, disconnect
              </Button>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
