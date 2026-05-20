import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, RefreshCw, type LucideIcon } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { cn } from "@/lib/utils"

type Tone = "violet" | "sky" | "fuchsia" | "rose" | "emerald" | "amber" | "neutral"

const TONES: Record<Tone, { hero: string; iconBg: string }> = {
  violet: { hero: "from-brand-soft/80 dark:from-primary/15", iconBg: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary" },
  sky: { hero: "from-sky-50 dark:from-sky-950/15", iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300" },
  fuchsia: { hero: "from-fuchsia-50 dark:from-fuchsia-950/15", iconBg: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300" },
  rose: { hero: "from-rose-50 dark:from-rose-950/15", iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" },
  emerald: { hero: "from-emerald-50 dark:from-emerald-950/15", iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" },
  amber: { hero: "from-amber-50 dark:from-amber-950/15", iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" },
  neutral: { hero: "from-muted dark:from-muted/40", iconBg: "bg-muted text-muted-foreground" },
}

const statusTone: Record<"connected" | "available" | "error", StatusTone> = {
  connected: "success",
  available: "neutral",
  error: "danger",
}

type Props = {
  name: string
  category: string
  description: string
  Icon: LucideIcon
  tone?: Tone
  status?: "connected" | "available" | "error"
  /** Optional "Last synced X ago" text. */
  lastSynced?: string
  /** External docs link. */
  docsHref?: string
  /** Footer is a slot — usually a save / disconnect button row. */
  footer?: React.ReactNode
  children: React.ReactNode
}

// Shared scaffold for /settings/integrations/<provider> pages.
// Provider supplies its own form fields + sections via children.
export function IntegrationShell({
  name,
  category,
  description,
  Icon,
  tone = "violet",
  status = "available",
  lastSynced,
  docsHref,
  footer,
  children,
}: Props) {
  const t = TONES[tone]
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  return (
    <PageShell title={name} withToolbar={false}>
      <div className="flex flex-col gap-5">
        <Link
          to="/settings/integrations"
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All integrations
        </Link>

        {/* Hero */}
        <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br via-card to-card p-5", t.hero)}>
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", t.iconBg)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{category}</p>
                <h2 className="mt-0.5 text-xl font-bold tracking-tight md:text-2xl">{name}</h2>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {status === "connected" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              ) : (
                <StatusBadge tone={statusTone[status]} withDot>
                  {status}
                </StatusBadge>
              )}
              {lastSynced && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> Synced {lastSynced}
                </span>
              )}
            </div>
          </div>

          {(status === "connected" || docsHref) && (
            <div className="relative mt-4 flex flex-wrap items-center gap-2">
              {status === "connected" && (
                <Button variant="outline" size="sm" className="bg-card">
                  <RefreshCw className="h-3.5 w-3.5" /> Sync now
                </Button>
              )}
              {docsHref && (
                <a
                  href={docsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Body — sections supplied by the provider */}
        <div className="flex flex-col gap-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 z-20 -mx-4 mt-2 border-t border-border bg-background/90 px-4 py-3 pwa-bottom backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:pt-3 md:pwa-bottom-0">
            {footer}
          </div>
        )}
      </div>
    </PageShell>
  )
}
