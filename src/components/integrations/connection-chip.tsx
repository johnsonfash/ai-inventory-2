import * as React from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, ChevronRight, CircleAlert, Plug } from "lucide-react"
import { getStatus, getProvider } from "@/lib/integrations/data"
import { cn } from "@/lib/utils"

// Reusable connection-status chip + card used wherever a feature
// depends on an external integration. Two surface shapes:
//
//   <ConnectionChip providerId="paystack" />
//     small inline pill: "Paystack ✓ connected" / "Connect Paystack"
//
//   <ConnectionCard providerId="mailchimp" />
//     a richer card with brand icon + status badge + manage link
//
// Both deep-link to /settings/integrations/{providerId} so the user
// goes straight to the connect / config flow.

type ChipProps = {
  providerId: string
  className?: string
}

export function ConnectionChip({ providerId, className }: ChipProps) {
  const provider = getProvider(providerId)
  const status = getStatus(providerId)
  if (!provider) return null

  const connected = status === "connected"
  const error = status === "error"
  const tone = connected ? "success" : error ? "danger" : "neutral"

  return (
    <Link
      to={`/settings/integrations/${provider.id}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300",
        tone === "danger"  && "border-rose-500/30 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300",
        tone === "neutral" && "border-border bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-white" style={{ background: provider.brand }}>
        <span className="text-[8px] font-black uppercase">{provider.letter}</span>
      </span>
      <span className="truncate">{provider.name}</span>
      {connected
        ? <CheckCircle2 className="h-3 w-3" />
        : error
          ? <CircleAlert className="h-3 w-3" />
          : <Plug className="h-3 w-3" />}
    </Link>
  )
}

type CardProps = {
  providerId: string
  /** What the integration is used for here — a short reason that
   *  contextualises why the user might want to connect it.
   *  e.g. "Powers card payments at checkout." */
  reason?: string
  className?: string
}

export function ConnectionCard({ providerId, reason, className }: CardProps) {
  const provider = getProvider(providerId)
  const status = getStatus(providerId)
  if (!provider) return null

  const connected = status === "connected"
  const error = status === "error"

  return (
    <Link
      to={`/settings/integrations/${provider.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 transition-colors",
        connected
          ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
          : error
            ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
            : "border-dashed border-border bg-muted/20 hover:border-brand/40 hover:bg-accent/30",
        className,
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm" style={{ background: provider.brand }}>
        {provider.letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{provider.name}</p>
          {connected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" /> Connected
            </span>
          )}
          {error && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              <CircleAlert className="h-2.5 w-2.5" /> Action needed
            </span>
          )}
          {!connected && !error && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Plug className="h-2.5 w-2.5" /> Not connected
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{reason ?? provider.tagline}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

// Quick helper — given a list of provider ids relevant to a feature,
// returns the count of connected vs total. Used in summary strips
// ("3 of 5 integrations connected").
export function useConnectionSummary(providerIds: string[]) {
  return React.useMemo(() => {
    const connected = providerIds.filter((id) => getStatus(id) === "connected").length
    return { connected, total: providerIds.length, allConnected: connected === providerIds.length }
  }, [providerIds])
}
