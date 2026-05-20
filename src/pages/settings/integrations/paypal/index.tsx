import { KeyRound, Webhook } from "lucide-react"
// PayPal isn't in lucide; using Wallet as the brand mark stand-in.
import { Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function PaypalConfig() {
  return (
    <IntegrationShell
      name="PayPal"
      category="Payments"
      description="Accept PayPal balance + Pay Later at checkout. Customers can also pay with linked cards."
      Icon={Wallet}
      tone="sky"
      status="available"
      docsHref="https://developer.paypal.com"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="App credentials" description="Found in your PayPal Developer dashboard" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Client ID" required>
            <Input placeholder="ATz…" />
          </FormField>
          <FormField label="Client secret" required>
            <Input type="password" placeholder="EH…" />
          </FormField>
          <FormField label="Environment">
            <Select defaultValue="live">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Currency">
            <Select defaultValue="USD">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="IPN webhook" description="Receive payment notifications" Icon={Webhook}>
        <FormField label="IPN URL" hint="Set this in PayPal → Profile → IPN Notifications.">
          <Input readOnly defaultValue="https://pallio.app/api/webhooks/paypal" />
        </FormField>
      </FormSection>

      <FormSection title="Checkout options" description="What PayPal shows the buyer" Icon={Wallet}>
        <div className="space-y-2">
          <SwitchField label="Enable Pay Later" description="Buy now, pay over 4 instalments." defaultChecked />
          <SwitchField label="Enable Venmo" description="US-only — Venmo balance at checkout." />
          <SwitchField label="Hide for currencies not in account" description="Skip the PayPal button when the buyer's currency isn't supported." defaultChecked />
        </div>
      </FormSection>
    </IntegrationShell>
  )
}
