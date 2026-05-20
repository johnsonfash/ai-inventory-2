import * as React from "react"
import { FileText, User, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { InputAddon } from "@/components/forms/input-addon"
import { SwitchField } from "@/components/forms/switch-field"

export default function NewInvoice() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New invoice"
      description="Bill a customer for products or services rendered."
      backHref="/sales/invoices"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "From order", body: "Invoicing existing sales orders auto-pulls line items + customer.", Icon: FileText },
            { title: "Numbering", body: "Prefix + padding come from Settings → Invoice. Next number is auto.", Icon: FileText },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Create invoice" submitting={submitting} cancelHref="/sales/invoices" />}
    >
      <FormSection title="Customer" Icon={User}>
        <FormGrid cols={2}>
          <FormField label="Customer" required>
            <Select defaultValue="nova">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nova">NovaApps</SelectItem>
                <SelectItem value="bright">BrightLane</SelectItem>
                <SelectItem value="acme">Acme Co</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Linked order" hint="Optional — pre-fill line items from a sales order.">
            <Select>
              <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SO-7842">SO-7842 · NovaApps</SelectItem>
                <SelectItem value="SO-7849">SO-7849 · BrightLane</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Amounts" Icon={Wallet}>
        <FormGrid cols={3}>
          <FormField label="Issue date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </FormField>
          <FormField label="Due date" required>
            <Input type="date" required />
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
          <FormField label="Subtotal">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" />
            </InputAddon>
          </FormField>
          <FormField label="Tax">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" />
            </InputAddon>
          </FormField>
          <FormField label="Total" required>
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Delivery" Icon={FileText}>
        <FormGrid cols={1}>
          <FormField label="Memo" hint="Shown on the invoice PDF.">
            <Textarea placeholder="Thanks for your business!" />
          </FormField>
          <SwitchField label="Email to customer immediately" description="Sends the PDF + payment link to the customer's email." defaultChecked />
          <SwitchField label="Attach receipt" description="Includes the proof-of-payment receipt." />
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
