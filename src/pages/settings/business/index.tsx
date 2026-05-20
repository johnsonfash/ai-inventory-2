import * as React from "react"
import { Building2, FileText, Globe, MapPin, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"

export default function BusinessSettings() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="Business details"
      description="Identity, registration, and global defaults — these flow into invoices, receipts, and reports."
      backHref="/settings"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 500)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Currency", body: "Changing this rebases historic reports — be cautious if you have invoices already issued.", Icon: Globe },
            { title: "Tax ID", body: "Shown on B2B invoices. Required in most VAT/GST jurisdictions.", Icon: FileText },
            { title: "Logo", body: "Square 512×512 PNG. Appears on receipts and the AppShell brand mark.", Icon: Building2 },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save changes" submitting={submitting} cancelHref="/settings" />}
    >
      <FormSection title="Company" description="Public-facing identity" Icon={Building2}>
        <FormGrid cols={2}>
          <FormField label="Legal name" required>
            <Input defaultValue="Acme Inc" required />
          </FormField>
          <FormField label="Trading name" hint="Shown to customers if different from the legal name.">
            <Input placeholder="Acme" />
          </FormField>
          <FormField label="Industry">
            <Select defaultValue="retail">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="restaurant">Restaurant / hospitality</SelectItem>
                <SelectItem value="services">Services / salon</SelectItem>
                <SelectItem value="auto">Auto / parts</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tax ID / VAT" hint="Used on B2B invoices.">
            <Input placeholder="GB123456789" />
          </FormField>
          <FormField label="Logo" span={2}>
            <Input type="file" accept="image/*" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Contact" description="How customers reach you" Icon={Phone}>
        <FormGrid cols={2}>
          <FormField label="Support email" required>
            <Input type="email" defaultValue="hello@acme.com" required />
          </FormField>
          <FormField label="Support phone">
            <Input type="tel" placeholder="+1 555 0100" />
          </FormField>
          <FormField label="Website" span={2}>
            <Input type="url" placeholder="https://acme.com" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Address" description="Registered place of business" Icon={MapPin}>
        <FormField label="Full address">
          <Textarea defaultValue="100 Congress Ave\nSuite 500\nAustin, TX 78701\nUnited States" />
        </FormField>
      </FormSection>

      <FormSection title="Defaults" description="Globally apply across the app" Icon={Globe}>
        <FormGrid cols={3}>
          <FormField label="Currency" required>
            <Select defaultValue="USD">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="NGN">NGN — Naira</SelectItem>
                <SelectItem value="JPY">JPY — Yen</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Time zone">
            <Select defaultValue="us-central">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="us-eastern">US Eastern</SelectItem>
                <SelectItem value="us-central">US Central</SelectItem>
                <SelectItem value="us-pacific">US Pacific</SelectItem>
                <SelectItem value="europe-london">Europe / London</SelectItem>
                <SelectItem value="africa-lagos">Africa / Lagos</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Fiscal year start">
            <Select defaultValue="january">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="january">January</SelectItem>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="july">July</SelectItem>
                <SelectItem value="october">October</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
