import * as React from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Eye,
  LayoutTemplate,
  Paperclip,
  Save,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/lists/status-badge"
import { InfoTooltip } from "@/components/info-tooltip"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TEMPLATES, interpolate } from "@/lib/comms/data"
import { MEMBERS } from "@/lib/team/data"
import { cn } from "@/lib/utils"

// Customer suggestions for the To picker. Same mock list used by the
// command palette so search feels consistent. Add `kind` so we can
// label sales-rep vs customer vs affiliate chips.
type Recipient = { id: string; name: string; email: string; kind: "customer" | "team" | "affiliate" }

const CUSTOMER_RECIPIENTS: Recipient[] = [
  { id: "c-1", name: "NovaApps",           email: "ops@novaapps.com",      kind: "customer" },
  { id: "c-2", name: "BrightLane",         email: "billing@brightlane.io", kind: "customer" },
  { id: "c-3", name: "Acme Co",            email: "ap@acme.co",            kind: "customer" },
  { id: "c-4", name: "Aisha N.",           email: "aisha@walkin.local",    kind: "customer" },
  { id: "c-5", name: "Cobalt Distributors",email: "po@cobalt.com",         kind: "customer" },
  { id: "c-6", name: "Delta Apparel",      email: "orders@deltaapparel.co",kind: "customer" },
  { id: "c-7", name: "Glow Co",            email: "wholesale@glowco.com",  kind: "customer" },
]

function teamRecipients(): Recipient[] {
  return MEMBERS.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    kind: m.role === "affiliate" ? "affiliate" : "team",
  }))
}

const ALL_RECIPIENTS: Recipient[] = [...CUSTOMER_RECIPIENTS, ...teamRecipients()]

export default function ComposeEmail() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const initialTemplateId = search.get("template")
  const initialTo = search.get("to") // email address from a deep link

  const [to, setTo] = React.useState<Recipient[]>(() => {
    if (!initialTo) return []
    const found = ALL_RECIPIENTS.find((r) => r.email === initialTo)
    return found ? [found] : []
  })
  const [cc, setCc] = React.useState<Recipient[]>([])
  const [showCc, setShowCc] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("<p></p>")
  const [templateId, setTemplateId] = React.useState<string>(initialTemplateId ?? "")
  const [variables, setVariables] = React.useState<Record<string, string>>({})
  const [preview, setPreview] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const template = TEMPLATES.find((t) => t.id === templateId)

  // Apply a template: load subject + body + seed variables with
  // sample values so the preview renders out of the box.
  const applyTemplate = (id: string) => {
    setTemplateId(id)
    const tpl = TEMPLATES.find((t) => t.id === id)
    if (!tpl) return
    const seeded: Record<string, string> = {}
    for (const t of tpl.tokens) seeded[t.key] = variables[t.key] ?? t.sample
    setVariables(seeded)
    setSubject(tpl.subject)
    setBody(tpl.body.trim())
  }

  const interpolatedSubject = template ? interpolate(subject, variables) : subject
  const interpolatedBody = template ? interpolate(body, variables) : body

  const onSend = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    toast.success(`Email queued for ${to.length} recipient${to.length === 1 ? "" : "s"}.`)
    navigate("/communications")
  }

  const onSaveDraft = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 300))
    setSubmitting(false)
    toast.success("Draft saved.")
    navigate("/communications")
  }

  return (
    <PageShell title="New email" withToolbar={false}>
      <div className="flex flex-col gap-4">
        <Link to="/communications" className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to inbox
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Composer column */}
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            {/* To */}
            <Field label="To" required>
              <RecipientPicker selected={to} onChange={setTo} />
            </Field>

            {!showCc ? (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="self-start text-xs font-semibold text-brand hover:underline dark:text-primary"
              >
                + Add Cc / Bcc
              </button>
            ) : (
              <Field label="Cc">
                <RecipientPicker selected={cc} onChange={setCc} />
              </Field>
            )}

            {/* Subject */}
            <Field label="Subject" required>
              <Input
                value={preview ? interpolatedSubject : subject}
                readOnly={preview}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Quick subject…"
              />
            </Field>

            {/* Body */}
            <Field label="Message" required>
              {preview ? (
                <div
                  className="prose-pallio rounded-xl border border-border bg-background p-4 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: interpolatedBody }}
                />
              ) : (
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  placeholder="Write your message — the toolbar above formats text, lists, links."
                  aria-label="Email body"
                />
              )}
            </Field>

            {/* Attach */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-3.5 w-3.5" /> Attach
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview((p) => !p)}
                >
                  <Eye className="h-3.5 w-3.5" /> {preview ? "Edit" : "Preview"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onSaveDraft} disabled={submitting}>
                  <Save className="h-3.5 w-3.5" /> Save draft
                </Button>
                <Button size="sm" onClick={onSend} disabled={submitting || to.length === 0 || !subject.trim()}>
                  {submitting ? "Sending…" : <>Send <Send className="h-3.5 w-3.5" /></>}
                </Button>
              </div>
            </div>
          </section>

          {/* Right rail: template + variables */}
          <aside className="flex flex-col gap-4">
            {/* Template picker */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm font-semibold">Template</h3>
                <InfoTooltip label="Templates" size="xs">
                  Pick one to pre-fill subject + body. Edit it after — the original template stays untouched. Make new templates from the Templates page.
                </InfoTooltip>
              </div>
              <Select value={templateId} onValueChange={(v) => v && applyTemplate(v)}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Pick a template…" /></SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {template && (
                <p className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 p-2 text-[11px] leading-relaxed text-muted-foreground">
                  {template.description}
                </p>
              )}
              <Link to="/communications/templates" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline dark:text-primary">
                <LayoutTemplate className="h-3 w-3" /> Manage templates
              </Link>
            </div>

            {/* Variables */}
            {template && template.tokens.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-sm font-semibold">Variables</h3>
                  <InfoTooltip label="Variables" size="xs">
                    Pallio replaces {"{{token}}"} occurrences in the subject + body with the values you set here. Live preview reflects them.
                  </InfoTooltip>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Fill these — they replace {"{{tokens}}"} in the body.</p>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {template.tokens.map((t) => (
                    <label key={t.key} className="flex flex-col gap-1 text-xs">
                      <span className="inline-flex items-center justify-between gap-2 font-medium text-foreground/80">
                        <span>{t.label}</span>
                        <code className="rounded bg-muted px-1 py-0.5 text-[9px] font-mono">{`{{${t.key}}}`}</code>
                      </span>
                      <Input
                        value={variables[t.key] ?? ""}
                        onChange={(e) => setVariables((prev) => ({ ...prev, [t.key]: e.target.value }))}
                        placeholder={t.sample}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* AI helper (visual only — wires to Pallio AI when backend lands) */}
            <div className="rounded-2xl border border-dashed border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 p-4 dark:from-primary/10 dark:to-emerald-950/15">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-sm font-semibold">Need help writing?</h3>
                <InfoTooltip label="AI draft" size="xs">
                  Coming soon — drop a prompt and Pallio AI drafts a starting point you can edit. Hooked up to the same backend that powers the Dashboard AI Insights.
                </InfoTooltip>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Pallio AI can draft from a one-line brief.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full" disabled>
                <Sparkles className="h-3.5 w-3.5" /> Draft with AI · coming soon
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function RecipientPicker({
  selected,
  onChange,
}: {
  selected: Recipient[]
  onChange: (next: Recipient[]) => void
}) {
  const [query, setQuery] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = ALL_RECIPIENTS.filter((r) => !selected.find((s) => s.id === r.id))
    if (!q) return filtered.slice(0, 8)
    return filtered.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)).slice(0, 12)
  }, [query, selected])

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 transition-colors",
          focused && "border-brand/60 ring-2 ring-brand/20 dark:border-primary/60 dark:ring-primary/20",
        )}
        onClick={() => setFocused(true)}
      >
        {selected.map((r) => (
          <RecipientChip key={r.id} recipient={r} onRemove={() => onChange(selected.filter((x) => x.id !== r.id))} />
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={selected.length === 0 ? "Type a name or email…" : ""}
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          <ul>
            {suggestions.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange([...selected, r])
                    setQuery("")
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <KindBadge kind={r.kind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{r.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{r.email}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RecipientChip({ recipient, onRemove }: { recipient: Recipient; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-1.5 pr-1 py-0.5 text-xs">
      <KindBadge kind={recipient.kind} compact />
      <span className="font-medium">{recipient.name}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">{recipient.email}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        aria-label={`Remove ${recipient.name}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function KindBadge({ kind, compact }: { kind: Recipient["kind"]; compact?: boolean }) {
  const cfg =
    kind === "customer" ? { label: "C", tone: "bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary" } :
    kind === "team" ?     { label: "T", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" } :
                          { label: "A", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        cfg.tone,
        compact ? "h-4 w-4 text-[9px]" : "h-5 w-5 text-[10px]",
      )}
      aria-label={kind}
      title={kind}
    >
      {cfg.label}
    </span>
  )
}

// _Users prevents unused-import warnings (we may add a team chip
// selector mode later).
const _Users = Users
void _Users
