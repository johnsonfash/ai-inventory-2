import { Instagram, KeyRound, Megaphone, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function InstagramAdsConfig() {
  return (
    <IntegrationShell
      name="Instagram Ads"
      category="Marketing"
      description="Reels, Stories, and Shoppable ads. Requires a connected Facebook Business account."
      Icon={Instagram}
      tone="fuchsia"
      status="connected"
      lastSynced="1 hour ago"
      docsHref="https://developers.facebook.com/docs/instagram-api"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Disconnect</Button>
          <Button type="button">Save changes</Button>
        </div>
      }
    >
      <FormSection title="App credentials" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="App ID" required>
            <Input placeholder="1234567890" />
          </FormField>
          <FormField label="Access token" required>
            <Input type="password" placeholder="EAA…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Business" Icon={Megaphone}>
        <FormGrid cols={2}>
          <FormField label="Business account ID" required>
            <Input placeholder="17841…" />
          </FormField>
          <FormField label="Ad account ID" required>
            <Input placeholder="act_…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Shopping" Icon={ShoppingBag}>
        <SwitchField label="Tag products in Reels" description="Auto-tag products from catalog when posted via Pallio." defaultChecked />
        <SwitchField label="Enable Stories shopping stickers" defaultChecked />
      </FormSection>
    </IntegrationShell>
  )
}
