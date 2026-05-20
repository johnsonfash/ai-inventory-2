import { Code2, Globe, KeyRound, Webhook } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function WebsiteConfig() {
  return (
    <IntegrationShell
      name="Custom website"
      category="E-commerce"
      description="Connect any storefront via the Pallio REST API. Push catalog + read orders."
      Icon={Globe}
      tone="emerald"
      status="available"
      docsHref="https://pallio.app/docs/api"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Generate API key</Button>
        </div>
      }
    >
      <FormSection title="Endpoint" description="Where your website lives" Icon={Globe}>
        <FormField label="Website URL" required>
          <Input placeholder="https://shop.acme.com" />
        </FormField>
      </FormSection>

      <FormSection title="API key" description="Use this for server-to-server calls" Icon={KeyRound}>
        <FormField label="Public key">
          <Input readOnly placeholder="No key generated yet" />
        </FormField>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tap "Generate API key" below to mint a new key. Keep it secret — anyone with this key can read your catalog and submit orders.
        </p>
      </FormSection>

      <FormSection title="Webhook (optional)" description="Push Pallio events to your website" Icon={Webhook}>
        <FormField label="Outbound webhook URL">
          <Input placeholder="https://shop.acme.com/api/pallio" />
        </FormField>
      </FormSection>

      <FormSection title="Capabilities" description="What this connection can do" Icon={Code2}>
        <FormGrid cols={1}>
          <SwitchField label="Push catalog updates" description="When items change in Pallio, POST to your webhook." defaultChecked />
          <SwitchField label="Accept incoming orders" description="Allow POST /orders from your website." defaultChecked />
          <SwitchField label="Allow inventory queries" description="GET /items/:sku/stock for live availability checks." defaultChecked />
        </FormGrid>
      </FormSection>
    </IntegrationShell>
  )
}
