import { ArrowLeftRight, KeyRound, ShoppingBag, Webhook } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function ShopifyConfig() {
  return (
    <IntegrationShell
      name="Shopify"
      category="E-commerce"
      description="Two-way sync of products, inventory, and orders with your Shopify store."
      Icon={ShoppingBag}
      tone="emerald"
      status="connected"
      lastSynced="12 minutes ago"
      docsHref="https://shopify.dev/docs/api"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Disconnect</Button>
          <Button type="button">Save changes</Button>
        </div>
      }
    >
      <FormSection title="Store" description="Where to sync" Icon={ShoppingBag}>
        <FormGrid cols={2}>
          <FormField label="Store domain" required>
            <Input placeholder="your-store.myshopify.com" defaultValue="acme.myshopify.com" />
          </FormField>
          <FormField label="Storefront name">
            <Input defaultValue="Acme Co" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Access" description="Admin API access token from your private app" Icon={KeyRound}>
        <FormField label="Admin API access token" required>
          <Input type="password" placeholder="shpat_…" defaultValue="shpat_*********************************" />
        </FormField>
      </FormSection>

      <FormSection title="Sync" description="What moves where" Icon={ArrowLeftRight}>
        <FormGrid cols={2}>
          <FormField label="Inventory direction">
            <Select defaultValue="pallio-source">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pallio-source">Pallio → Shopify (Pallio is source of truth)</SelectItem>
                <SelectItem value="shopify-source">Shopify → Pallio</SelectItem>
                <SelectItem value="two-way">Two-way (last-write-wins)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Default Pallio location">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Warehouse A</SelectItem>
                <SelectItem value="wh-b">Warehouse B</SelectItem>
                <SelectItem value="wh-c">Warehouse C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField span={2}>
            <SwitchField label="Sync products" description="Create new Pallio items when Shopify products are added." defaultChecked />
          </FormField>
          <FormField span={2}>
            <SwitchField label="Sync orders" description="Pull paid Shopify orders into Pallio for fulfilment." defaultChecked />
          </FormField>
          <FormField span={2}>
            <SwitchField label="Auto-fulfil in Shopify" description="Mark Shopify orders fulfilled when Pallio creates the shipment." defaultChecked />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Webhooks" description="Live event stream" Icon={Webhook}>
        <FormField label="Webhook URL">
          <Input readOnly defaultValue="https://pallio.app/api/webhooks/shopify" />
        </FormField>
      </FormSection>
    </IntegrationShell>
  )
}
