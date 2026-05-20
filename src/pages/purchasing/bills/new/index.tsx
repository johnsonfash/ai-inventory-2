import * as React from "react"
import { CalendarDays, Paperclip, Receipt, Wallet } from "lucide-react"
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

export default function NewBill() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New vendor bill"
      description="Record an invoice received from a supplier."
      backHref="/purchasing/bills"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Link to PO", body: "Linking auto-matches line items and prevents over-billing.", Icon: Receipt },
            { title: "Attachment", body: "Drag in the PDF you received from the vendor for the record.", Icon: Paperclip },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save bill" submitting={submitting} cancelHref="/purchasing/bills" />}
    >
      <FormSection title="Vendor + reference" Icon={Receipt}>
        <FormGrid cols={3}>
          <FormField label="Vendor" required>
            <Select defaultValue="cobalt">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cobalt">Cobalt Distributors</SelectItem>
                <SelectItem value="delta">Delta Apparel</SelectItem>
                <SelectItem value="acme">Acme Supplies</SelectItem>
                <SelectItem value="glow">Glow Co</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Bill number" required hint="From the vendor's invoice.">
            <Input placeholder="ACME-99021" required />
          </FormField>
          <FormField label="Linked PO" hint="Optional — match against an existing purchase order.">
            <Select>
              <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PO-1042">PO-1042</SelectItem>
                <SelectItem value="PO-1041">PO-1041</SelectItem>
                <SelectItem value="PO-1040">PO-1040</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Dates + amount" Icon={CalendarDays}>
        <FormGrid cols={3}>
          <FormField label="Bill date" required>
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

      <FormSection title="Attachment + flags" Icon={Wallet}>
        <FormGrid cols={1}>
          <FormField label="Attach invoice PDF" hint="Max 8MB.">
            <Input type="file" accept="application/pdf,image/*" />
          </FormField>
          <SwitchField label="Hold for review" description="Don't move into AP aging until a manager approves." />
          <SwitchField label="Pay automatically" description="Once due, attempt payment via the vendor's default method." />
          <FormField label="Notes">
            <Textarea placeholder="Anything internal about this bill…" />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
