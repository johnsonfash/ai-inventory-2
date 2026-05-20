import { KeyRound, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function ShippoConfig() {
  return (
    <IntegrationShell
      name="Shippo"
      category="Shipping"
      description="Alternative multi-carrier rates and label purchase."
      Icon={Truck}
      tone="sky"
      status="available"
      docsHref="https://goshippo.com/docs"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="API key" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Live key" required>
            <Input type="password" placeholder="shippo_live_…" />
          </FormField>
          <FormField label="Test key">
            <Input type="password" placeholder="shippo_test_…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Carriers" Icon={Truck}>
        <SwitchField label="USPS" defaultChecked />
        <SwitchField label="UPS" defaultChecked />
        <SwitchField label="FedEx" defaultChecked />
        <SwitchField label="DHL" />
      </FormSection>
    </IntegrationShell>
  )
}
