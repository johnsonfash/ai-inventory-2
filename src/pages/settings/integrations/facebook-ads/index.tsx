import { Facebook, KeyRound, Megaphone, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function FacebookAdsConfig() {
  return (
    <IntegrationShell
      name="Facebook Ads"
      category="Marketing"
      description="Run product-feed ads across Facebook placements. Uses the Marketing API."
      Icon={Facebook}
      tone="sky"
      status="connected"
      lastSynced="1 hour ago"
      docsHref="https://developers.facebook.com/docs/marketing-api"
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
            <Input placeholder="1234567890" defaultValue="6049223…" />
          </FormField>
          <FormField label="App secret" required>
            <Input type="password" placeholder="••••••" />
          </FormField>
          <FormField label="Long-lived access token" required span={2}>
            <Input type="password" placeholder="EAA…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Ad account" Icon={Megaphone}>
        <FormGrid cols={2}>
          <FormField label="Ad account ID" required>
            <Input placeholder="act_…" defaultValue="act_8821…" />
          </FormField>
          <FormField label="Business Page ID">
            <Input placeholder="9876543210" />
          </FormField>
          <FormField label="Default placement">
            <Select defaultValue="auto">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Advantage+ placements (auto)</SelectItem>
                <SelectItem value="feed">Feed only</SelectItem>
                <SelectItem value="stories">Stories only</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Product catalog" Icon={ShoppingBag}>
        <FormGrid cols={1}>
          <FormField label="Catalog ID">
            <Input placeholder="123456789012" />
          </FormField>
          <SwitchField label="Auto-sync catalog" description="Push Pallio product updates to Facebook in real time." defaultChecked />
          <SwitchField label="Auto-pause on out-of-stock" description="Pause ads for any item that hits 0 stock." defaultChecked />
        </FormGrid>
      </FormSection>
    </IntegrationShell>
  )
}
