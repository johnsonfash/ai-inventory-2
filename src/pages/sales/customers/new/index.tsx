import * as React from "react"
import { Building2, Lightbulb, MapPin, Tag, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"

export default function NewCustomer() {
  const [sameShipping, setSameShipping] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="New customer"
      description="Contact info, addresses, and trading terms."
      backHref="/sales/customers"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 600)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Customer type", body: "Pick Wholesale to unlock per-customer price lists later.", Icon: Building2 },
            { title: "Tax ID", body: "Required for B2B invoices in some regions. Leave blank for retail.", Icon: Tag },
            { title: "Addresses", body: "Defaults to one shared billing/shipping address. Toggle off to split.", Icon: MapPin },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save customer" submitting={submitting} cancelHref="/sales/customers" />}
    >
      <FormSection title="Contact" description="How to reach this customer" Icon={User}>
        <FormGrid cols={2}>
          <FormField label="Name" required hint="Business name or contact full name.">
            <Input placeholder="NovaApps" required />
          </FormField>
          <FormField label="Customer type">
            <Select defaultValue="retail">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Email" required>
            <Input type="email" placeholder="ops@novaapps.io" required />
          </FormField>
          <FormField label="Phone">
            <Input type="tel" placeholder="+1 555 0123" />
          </FormField>
          <FormField label="Tax ID / VAT" hint="For B2B invoicing.">
            <Input placeholder="GB123456789" />
          </FormField>
          <FormField label="Notes" span={2}>
            <Textarea placeholder="Internal notes — not shown to the customer." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Addresses" description="Where invoices and goods go" Icon={MapPin}>
        <FormGrid cols={1}>
          <FormField label="Billing address">
            <Textarea placeholder="Street, City, State, ZIP, Country" />
          </FormField>
          <FormField>
            <SwitchField
              label="Shipping address is the same as billing"
              description="Disable to capture a separate shipping address."
              checked={sameShipping}
              onCheckedChange={setSameShipping}
            />
          </FormField>
          {!sameShipping && (
            <FormField label="Shipping address">
              <Textarea placeholder="Street, City, State, ZIP, Country" />
            </FormField>
          )}
        </FormGrid>
      </FormSection>

      <FormSection title="Trading terms" description="Pricing and payment defaults" Icon={Lightbulb}>
        <FormGrid cols={2}>
          <FormField label="Default price list">
            <Select defaultValue="retail">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Payment terms">
            <Select defaultValue="net14">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="net7">Net 7</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Send invoices automatically on order fulfilment"
              description="Pallio will email the invoice as soon as the order is marked fulfilled."
              defaultChecked
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
