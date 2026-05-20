import { KeyRound, MapPin, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function FacebookMarketplaceConfig() {
  return (
    <IntegrationShell
      name="Facebook Marketplace"
      category="Marketing"
      description="Auto-list Pallio products on Marketplace. Local pickup + national shipping options."
      Icon={ShoppingBag}
      tone="violet"
      status="available"
      docsHref="https://developers.facebook.com/docs/marketing-api/catalog"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="Credentials" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Page ID" required>
            <Input placeholder="123456789012" />
          </FormField>
          <FormField label="Catalog ID" required>
            <Input placeholder="987654321098" />
          </FormField>
          <FormField label="Access token" required span={2}>
            <Input type="password" placeholder="EAA…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Listing defaults" Icon={MapPin}>
        <FormGrid cols={2}>
          <FormField label="Default location">
            <Input placeholder="Austin, TX" />
          </FormField>
          <FormField label="Delivery method">
            <Select defaultValue="both">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local pickup only</SelectItem>
                <SelectItem value="shipping">Shipping only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Condition">
            <Select defaultValue="new">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used-like-new">Used — like new</SelectItem>
                <SelectItem value="used-good">Used — good</SelectItem>
                <SelectItem value="used-fair">Used — fair</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Sync" Icon={ShoppingBag}>
        <SwitchField label="Auto-publish new items" description="Push every new Pallio item to Marketplace." />
        <SwitchField label="Auto-delist when out of stock" description="Removes the listing when stock hits 0." defaultChecked />
      </FormSection>
    </IntegrationShell>
  )
}
