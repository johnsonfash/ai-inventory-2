import { ArrowLeftRight, Globe, KeyRound, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function WoocommerceConfig() {
  return (
    <IntegrationShell
      name="WooCommerce"
      category="E-commerce"
      description="Sync products, orders, and stock with your WooCommerce / WordPress store."
      Icon={ShoppingBag}
      tone="violet"
      status="available"
      docsHref="https://woocommerce.com/document/woocommerce-rest-api/"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="Site" description="The WordPress site running WooCommerce" Icon={Globe}>
        <FormGrid cols={2}>
          <FormField label="Site URL" required hint="Include https:// — no trailing slash.">
            <Input placeholder="https://shop.example.com" />
          </FormField>
          <FormField label="Storefront name">
            <Input placeholder="Acme Co Shop" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="REST API keys" description="WooCommerce → Settings → Advanced → REST API" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Consumer key" required>
            <Input placeholder="ck_…" />
          </FormField>
          <FormField label="Consumer secret" required>
            <Input type="password" placeholder="cs_…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Sync" description="Direction and scope" Icon={ArrowLeftRight}>
        <FormGrid cols={1}>
          <FormField label="Inventory direction">
            <Select defaultValue="pallio-source">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pallio-source">Pallio → WooCommerce</SelectItem>
                <SelectItem value="woo-source">WooCommerce → Pallio</SelectItem>
                <SelectItem value="two-way">Two-way</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <SwitchField label="Pull orders automatically" description="Every 5 minutes." defaultChecked />
          <SwitchField label="Update Woo stock after POS sales" description="Decrement Woo stock when items sell at the register." defaultChecked />
        </FormGrid>
      </FormSection>
    </IntegrationShell>
  )
}
