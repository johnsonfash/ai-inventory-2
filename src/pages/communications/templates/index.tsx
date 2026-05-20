import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Copy, Lock, Plus, Search, Sparkles } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge, type StatusTone } from "@/components/lists/status-badge"
import { SummaryStrip } from "@/components/lists/summary-strip"
import { InfoTooltip } from "@/components/info-tooltip"
import { TEMPLATES } from "@/lib/comms/data"
import type { TemplateCategory } from "@/lib/comms/types"
import { cn } from "@/lib/utils"

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  transactional: "Transactional",
  marketing: "Marketing",
  ops: "Ops",
  team: "Team",
}

const CATEGORY_TONE: Record<TemplateCategory, StatusTone> = {
  transactional: "info",
  marketing: "warning",
  ops: "success",
  team: "brand",
}

export default function TemplatesLibrary() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<"all" | TemplateCategory>("all")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter((t) => category === "all" || t.category === category).filter((t) => {
      if (!q) return true
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
    })
  }, [query, category])

  const byCategory: Record<TemplateCategory, number> = {
    transactional: 0, marketing: 0, ops: 0, team: 0,
  }
  for (const t of TEMPLATES) byCategory[t.category]++

  return (
    <PageShell title="Email templates" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <Link to="/communications" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to inbox
        </Link>

        <SummaryStrip
          tiles={[
            { label: "Templates",    value: String(TEMPLATES.length), tone: "brand",   hint: "in library" },
            { label: "Transactional",value: String(byCategory.transactional), tone: "info",    hint: "invoices, receipts" },
            { label: "Marketing",    value: String(byCategory.marketing), tone: "warning", hint: "promos, restocks" },
            { label: "Internal",     value: String(byCategory.team + byCategory.ops), tone: "success", hint: "team + ops" },
          ]}
        />

        {/* Filters + new */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {(["all", "transactional", "marketing", "ops", "team"] as const).map((c) => (
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
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates…" className="pl-9" />
            </div>
            <Button>
              <Plus className="h-4 w-4" /> New template
            </Button>
          </div>
        </div>

        {/* Template grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <article key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{t.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{t.description}</p>
                </div>
                {t.builtin && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <Lock className="h-2.5 w-2.5" /> built-in
                  </span>
                )}
              </div>

              <div className="mt-3 rounded-lg border border-dashed border-border bg-background/40 p-2 text-[11px] text-muted-foreground">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">Subject</p>
                <p className="mt-0.5 line-clamp-2 font-medium text-foreground">{t.subject}</p>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusBadge tone={CATEGORY_TONE[t.category]}>{CATEGORY_LABEL[t.category]}</StatusBadge>
                <span className="text-[10px] text-muted-foreground">
                  {t.tokens.length} variable{t.tokens.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                <Button size="sm" variant="ghost">
                  <Copy className="h-3.5 w-3.5" /> {t.builtin ? "Clone" : "Edit"}
                </Button>
                <Link to={`/communications/new?template=${t.id}`}>
                  <Button size="sm">
                    Use template <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* AI helper card */}
        <section className="rounded-2xl border border-dashed border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-4 dark:from-primary/10 dark:to-emerald-950/15">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-bold tracking-tight">Need a new template?</h3>
            <InfoTooltip label="AI templates" size="xs">
              Describe what you want — "an apology when a shipment is delayed" — and Pallio AI drafts a complete template with the right variables. Lands when the AI backend ships.
            </InfoTooltip>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pallio AI can draft one in a few seconds — just describe the use case.
          </p>
          <Button size="sm" className="mt-3" disabled>
            <Sparkles className="h-3.5 w-3.5" /> Draft a template with AI · coming soon
          </Button>
        </section>
      </div>
    </PageShell>
  )
}
