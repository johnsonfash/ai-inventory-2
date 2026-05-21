import { KeyRound, MapPin, PackageCheck, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function EasypostConfig() {
  return (
    <IntegrationShell
      name="EasyPost"
      category="Shipping"
      description="Compare carrier rates and purchase shipping labels from inside Pallio."
      Icon={PackageCheck}
      tone="amber"
      status="connected"
      lastSynced="just now"
      docsHref="https://docs.easypost.com"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Disconnect</Button>
          <Button type="button">Save changes</Button>
        </div>
      }
    >
      <FormSection title="API key" description="From EasyPost dashboard" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Production key" required>
            <Input type="password" placeholder="EZAK…" defaultValue="EZAK*****************************" />
          </FormField>
          <FormField label="Test key">
            <Input type="password" placeholder="EZTK…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Carriers" description="Which carriers to compare" Icon={Truck}>
        <FormGrid cols={1}>
          <SwitchField label="UPS" defaultChecked />
          <SwitchField label="USPS" defaultChecked />
          <SwitchField label="FedEx" defaultChecked />
          <SwitchField label="DHL Express" />
          <SwitchField label="Canada Post" />
        </FormGrid>
      </FormSection>

      <FormSection title="Default origin" description="Where parcels ship from" Icon={MapPin}>
        <FormGrid cols={1}>
          <FormField label="Origin warehouse">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Warehouse A (Austin)</SelectItem>
                <SelectItem value="wh-b">Warehouse B (Atlanta)</SelectItem>
                <SelectItem value="wh-c">Warehouse C (Portland)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Return address" hint="Pre-filled on every label.">
            <Textarea defaultValue={"Funke Apparel Co.\n12 Admiralty Way\nLekki Phase 1, Lagos 106104"} />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={PackageCheck}>
        <SwitchField label="Auto-buy cheapest label" description="When fulfilling an order, automatically purchase the lowest-cost label across enabled carriers." />
        <SwitchField label="Email tracking to customer" description="Send the tracking number as soon as a label is bought." defaultChecked />
      </FormSection>
    </IntegrationShell>
  )
}
