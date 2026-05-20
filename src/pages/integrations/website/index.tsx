import * as React from "react"
import { Code2, Copy, Globe, Sparkles } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"

const snippet = `<script
  src="https://cdn.pallio.app/widget.js"
  data-store-id="STORE_ID"
  defer
></script>`

export default function WebsiteIntegration() {
  const [copied, setCopied] = React.useState(false)
  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <PageShell title="Website widget" withToolbar={false}>
      <div className="flex flex-col gap-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft via-card to-card p-5 dark:from-primary/15">
          <div className="relative flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
              <Globe className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Integration</p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight md:text-2xl">Website widget</h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                Drop a single &lt;script&gt; tag on any page to show your live catalog, accept orders, and book appointments.
              </p>
            </div>
          </div>
        </div>

        {/* Embed snippet */}
        <FormSection title="Embed snippet" description="Add this to your website's HTML, just before </body>" Icon={Code2}>
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs">
            <pre className="whitespace-pre-wrap break-all">{snippet}</pre>
            <button
              type="button"
              onClick={copy}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium hover:bg-accent"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </FormSection>

        <FormSection title="Configuration" description="Per-store widget behaviour" Icon={Sparkles}>
          <FormGrid cols={2}>
            <FormField label="Store ID" hint="Replace STORE_ID in the snippet with this value.">
              <Input readOnly defaultValue="pallio_8472a91b" />
            </FormField>
            <FormField label="Brand colour" hint="Used for widget buttons and accents.">
              <Input defaultValue="#7c3aed" />
            </FormField>
            <FormField label="Allowed domains" span={2} hint="Comma-separated. Leave blank to allow any.">
              <Textarea placeholder="https://shop.acme.com, https://acme.com" />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection title="Features" description="Which widget modules to enable" Icon={Globe}>
          <div className="flex flex-col gap-2">
            <SwitchField label="Catalog browse" description="Show product grid + search." defaultChecked />
            <SwitchField label="Cart + checkout" description="Allow visitors to buy directly from the widget." defaultChecked />
            <SwitchField label="Appointments" description="Let customers book appointments." />
            <SwitchField label="Live stock counts" description="Show real-time availability per item." defaultChecked />
            <SwitchField label="Customer login" description="Returning customers can sign in to see order history." />
          </div>
        </FormSection>

        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">
            Need a fully custom integration?{" "}
            <a href="https://pallio.app/docs/api" className="font-medium text-brand hover:underline dark:text-primary">
              Use the REST API
            </a>{" "}instead.
          </p>
          <Button>Save widget config</Button>
        </div>
      </div>
    </PageShell>
  )
}
