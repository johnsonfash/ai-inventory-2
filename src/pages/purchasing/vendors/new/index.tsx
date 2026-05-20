import * as React from "react"
import { Building2, CreditCard, MapPin, Tag } from "lucide-react"
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

export default function NewVendor() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="New vendor"
      description="Contact, address, and payment defaults."
      backHref="/purchasing/vendors"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 600)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Tax ID", body: "Required for VAT-reclaim in many regions. Capture it once here.", Icon: Tag },
            { title: "Lead time", body: "Default lead time pre-fills PO due dates and reorder suggestions.", Icon: Building2 },
            { title: "Payment terms", body: "Default terms here flow into every PO created for this vendor.", Icon: CreditCard },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save vendor" submitting={submitting} cancelHref="/purchasing/vendors" />}
    >
      <FormSection title="Contact" description="Reach this supplier" Icon={Building2}>
        <FormGrid cols={2}>
          <FormField label="Vendor name" required>
            <Input placeholder="Cobalt Distributors" required />
          </FormField>
          <FormField label="Account manager">
            <Input placeholder="Sarah K." />
          </FormField>
          <FormField label="Email" required>
            <Input type="email" placeholder="sales@cobalt.com" required />
          </FormField>
          <FormField label="Phone">
            <Input type="tel" placeholder="+1 555 0100" />
          </FormField>
          <FormField label="Website">
            <Input type="url" placeholder="https://cobalt.com" />
          </FormField>
          <FormField label="Tax ID">
            <Input placeholder="EIN / VAT number" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Address" description="Billing and shipping origin" Icon={MapPin}>
        <FormField label="Billing address">
          <Textarea placeholder="Street, City, State, ZIP, Country" />
        </FormField>
      </FormSection>

      <FormSection title="Trading terms" description="PO defaults" Icon={CreditCard}>
        <FormGrid cols={3}>
          <FormField label="Payment terms">
            <Select defaultValue="net30">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="net7">Net 7</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
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
                <SelectItem value="NGN">NGN</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Default lead time">
            <InputAddon trailing="days">
              <input type="number" defaultValue={14} />
            </InputAddon>
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
