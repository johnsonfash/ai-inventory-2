import * as React from "react"
import { CalendarDays, FileMinus, Wallet } from "lucide-react"
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
import { useCurrency, formatPriceFor } from "@/contexts/currency"

export default function NewVendorCredit() {
  const [submitting, setSubmitting] = React.useState(false)
  const { symbol } = useCurrency()
  return (
    <FormShell
      title="New vendor credit"
      description="Record a credit memo from a supplier — applied to future bills."
      backHref="/purchasing/vendor-credits"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Apply to bill", body: "Linking to an open bill auto-reduces what's owed.", Icon: Wallet },
            { title: "Expiry", body: "Some vendors void unused credits after a window — set it here so we remind you.", Icon: CalendarDays },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save credit" submitting={submitting} cancelHref="/purchasing/vendor-credits" />}
    >
      <FormSection title="Source" Icon={FileMinus}>
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
          <FormField label="Credit memo #" required>
            <Input placeholder="CM-4471" required />
          </FormField>
          <FormField label="Reason">
            <Select defaultValue="overbilling">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="overbilling">Overbilling</SelectItem>
                <SelectItem value="damaged">Damaged shipment</SelectItem>
                <SelectItem value="short">Short shipment</SelectItem>
                <SelectItem value="rebate">Rebate / promo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Amount + apply" Icon={Wallet}>
        <FormGrid cols={3}>
          <FormField label="Credit amount" required>
            <InputAddon leading={symbol}>
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
          </FormField>
          <FormField label="Apply to bill" hint="Optional — leave blank to add to vendor balance.">
            <Select>
              <SelectTrigger><SelectValue placeholder="(vendor balance)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BILL-9001">BILL-9001 · {formatPriceFor(4820)}</SelectItem>
                <SelectItem value="BILL-9002">BILL-9002 · {formatPriceFor(1240)}</SelectItem>
                <SelectItem value="BILL-9003">BILL-9003 · {formatPriceFor(920)}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Expiry">
            <Input type="date" />
          </FormField>
          <FormField label="Notes" span={3}>
            <Textarea placeholder="What happened, who agreed, supporting reference…" />
          </FormField>
          <FormField span={3}>
            <SwitchField label="Notify vendor" description="Send a confirmation email back to the vendor." />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
