import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { CheckCircle2, Copy, Eye, EyeOff, ExternalLink, ShieldCheck, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwitchField } from "@/components/forms/switch-field"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { connectProvider } from "@/lib/integrations/data"
import type { IntegrationProvider } from "@/lib/integrations/types"

type Props = {
  open: boolean
  provider: IntegrationProvider | null
  onClose: () => void
  /** Called after the user confirms a successful connection. */
  onConnected: () => void
}

// ConnectModal — dual-face (bottom sheet on mobile, centred modal on
// desktop). Renders the provider's field schema dynamically; sensitive
// fields get a reveal toggle. "Test connection" runs a fake check
// (~700 ms) that succeeds when required fields are non-empty — on
// real backend this would `POST /integrations/test`.

export function ConnectModal({ open, provider, onClose, onConnected }: Props) {
  const isMobile = useIsMobile()
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({})
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<"idle" | "ok" | "fail">("idle")
  const [submitting, setSubmitting] = React.useState(false)

  // Reset when re-opening for a fresh provider.
  React.useEffect(() => {
    if (!open || !provider) return
    setValues({})
    setRevealed({})
    setTestResult("idle")
    setSubmitting(false)
    setTesting(false)
  }, [open, provider])

  // Body scroll lock + Esc close.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (typeof document === "undefined" || !provider) {
    // Render nothing — Portal short-circuits if no provider.
    return null
  }

  const allRequiredFilled = provider.fields
    .filter((f) => f.required)
    .every((f) => (values[f.key] ?? "").trim().length > 0)

  const test = async () => {
    setTesting(true)
    setTestResult("idle")
    await new Promise((r) => setTimeout(r, 700))
    setTesting(false)
    const ok = allRequiredFilled
    setTestResult(ok ? "ok" : "fail")
    if (!ok) toast.error("Test failed — fill every required field first.")
    else toast.success("Test request returned 200. You're good to connect.")
  }

  const submit = async () => {
    if (!allRequiredFilled) {
      toast.error("Fill every required field first.")
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    await connectProvider(provider.id, values)
    setSubmitting(false)
    toast.success(`${provider.name} connected.`)
    onConnected()
    onClose()
  }

  const copyValue = async (val: string, label: string) => {
    try {
      await navigator.clipboard.writeText(val)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Couldn't copy")
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className={cn(
            "fixed inset-0 z-[80] flex bg-black/60 backdrop-blur-md",
            isMobile ? "items-end" : "items-center justify-center px-4 py-6",
          )}
          role="dialog"
          aria-modal="true"
          aria-label={`Connect ${provider.name}`}
          onClick={onClose}
        >
          <motion.div
            initial={isMobile ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex w-full max-w-lg flex-col overflow-hidden bg-card text-foreground shadow-2xl shadow-black/40",
              isMobile ? "rounded-t-3xl max-h-[92dvh]" : "rounded-2xl border border-border",
            )}
          >
            {/* Hero — provider brand colour banner */}
            <header
              className="relative overflow-hidden border-b border-border px-5 py-5"
              style={{
                background: `linear-gradient(135deg, ${provider.brand}33, transparent 70%)`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl"
                style={{ background: `${provider.brand}55` }}
                aria-hidden
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/60 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative flex items-start gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold text-white shadow-sm"
                  style={{ background: provider.brand }}
                >
                  {provider.letter}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold tracking-tight">Connect {provider.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{provider.tagline}</p>
                </div>
              </div>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{provider.description}</p>

              {provider.docsUrl && (
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline dark:text-primary"
                >
                  Where do I find these? <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {/* Fields */}
              <div className="mt-5 flex flex-col gap-4">
                {provider.fields.map((f) => {
                  const value = values[f.key] ?? ""
                  if (f.kind === "select") {
                    return (
                      <FieldRow key={f.key} field={f}>
                        <Select value={value} onValueChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}>
                          <SelectTrigger><SelectValue placeholder={f.placeholder ?? "Choose…"} /></SelectTrigger>
                          <SelectContent>
                            {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FieldRow>
                    )
                  }
                  if (f.kind === "switch") {
                    return (
                      <SwitchField
                        key={f.key}
                        label={f.label}
                        description={f.hint}
                        checked={value === "true"}
                        onCheckedChange={(checked) => setValues((p) => ({ ...p, [f.key]: checked ? "true" : "" }))}
                      />
                    )
                  }
                  const isSensitive = f.kind === "password" || f.sensitive
                  const reveal = revealed[f.key] === true
                  return (
                    <FieldRow key={f.key} field={f}>
                      <div className="relative">
                        <Input
                          type={isSensitive && !reveal ? "password" : f.kind === "url" ? "url" : "text"}
                          value={value}
                          onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className={isSensitive ? "pr-20" : f.placeholder?.startsWith("https://") ? "pr-9" : ""}
                          required={f.required}
                          autoComplete={isSensitive ? "off" : undefined}
                        />
                        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
                          {f.placeholder?.startsWith("https://") && value && (
                            <button
                              type="button"
                              onClick={() => copyValue(value, f.label)}
                              aria-label={`Copy ${f.label}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {isSensitive && (
                            <button
                              type="button"
                              onClick={() => setRevealed((p) => ({ ...p, [f.key]: !p[f.key] }))}
                              aria-label={reveal ? "Hide" : "Reveal"}
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </FieldRow>
                  )
                })}
              </div>

              {/* Trust strip */}
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p>
                  Pallio encrypts everything you paste here before storing. You can rotate or revoke the connection any time from the integration's detail page.
                </p>
              </div>

              {/* Test result */}
              {testResult === "ok" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Test request returned 200. Hit Connect to save.</p>
                </div>
              )}
              {testResult === "fail" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-300">
                  <X className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Test failed — double-check your keys + try again.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-5 py-3">
              <Button type="button" variant="ghost" onClick={test} disabled={testing || !allRequiredFilled}>
                <Zap className="h-3.5 w-3.5" /> {testing ? "Testing…" : "Test"}
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="button" onClick={submit} disabled={submitting || !allRequiredFilled}>
                  {submitting ? "Connecting…" : "Connect"}
                </Button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function FieldRow({ field, children }: { field: { label: string; hint?: string; required?: boolean }; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
        {field.label}
        {field.required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {field.hint && <span className="text-[11px] text-muted-foreground">{field.hint}</span>}
    </label>
  )
}
