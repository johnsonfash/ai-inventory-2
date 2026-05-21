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
      titleTooltip={
        <>
          The identity block for your whole Pallio account. Legal +
          trading names, address, contact, tax ID, logo, and the
          business-wide defaults (currency, time zone, fiscal year).
          Set it once; every invoice, receipt, and report inherits.
        </>
      }
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
          <FormField
            label="Legal name"
            required
            tooltip="The exact name on your business registration documents (your CAC certificate in Nigeria). Pallio uses this on official paperwork like invoices and tax filings."
          >
            <Input defaultValue="Funke Apparel Co. Ltd." required />
          </FormField>
          <FormField
            label="Trading name"
            hint="Shown to customers if different from the legal name."
            tooltip={
              <>
                The friendly name customers actually know you by. For example,
                your legal name might be <em>Funke Apparel Co. Ltd.</em> but
                you advertise as just <em>Funke Apparel</em>. Leave this blank
                if they're the same.
              </>
            }
          >
            <Input placeholder="Funke Apparel" />
          </FormField>
          <FormField
            label="Industry"
            tooltip="Pallio uses this to pre-fill smart defaults — for example, restaurants get table management, services get bookings, retail gets a barcode-friendly POS."
          >
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
          <FormField
            label="Tax ID / VAT"
            hint="Used on B2B invoices."
            tooltip={
              <>
                Your government tax number. In Nigeria this is your{" "}
                <strong>TIN</strong> (Tax Identification Number) or
                <strong> VAT</strong> registration number. Other countries call
                it a GST number or EIN. It's required on business-to-business
                invoices so your buyer can reclaim VAT.
              </>
            }
          >
            <Input placeholder="12345678-0001" />
          </FormField>
          <FormField
            label="Logo"
            span={2}
            tooltip="Square PNG (at least 512×512 px). Appears on receipts, invoices, and the AppShell brand mark. JPGs work too but PNG keeps a transparent background."
          >
            <Input type="file" accept="image/*" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Contact" description="How customers reach you" Icon={Phone}>
        <FormGrid cols={2}>
          <FormField label="Support email" required>
            <Input type="email" defaultValue="hello@funkeapparel.com" required />
          </FormField>
          <FormField label="Support phone">
            <Input type="tel" placeholder="+234 903 672 3177" />
          </FormField>
          <FormField label="Website" span={2}>
            <Input type="url" placeholder="https://funkeapparel.com" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Address" description="Registered place of business" Icon={MapPin}>
        <FormField label="Full address">
          <Textarea defaultValue={"12 Admiralty Way\nLekki Phase 1\nLagos 106104\nNigeria"} />
        </FormField>
      </FormSection>

      <FormSection title="Defaults" description="Globally apply across the app" Icon={Globe}>
        <FormGrid cols={3}>
          <FormField
            label="Currency"
            required
            tooltip="The currency you do business in. Every price, total, report, and POS button uses this symbol. You can override per-customer (e.g. invoice a foreign client in USD) later."
          >
            <Select defaultValue="NGN">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN — Nigerian Naira</SelectItem>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="GBP">GBP — British Pound</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GHS">GHS — Ghanaian Cedi</SelectItem>
                <SelectItem value="KES">KES — Kenyan Shilling</SelectItem>
                <SelectItem value="ZAR">ZAR — South African Rand</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Time zone"
            tooltip="So receipts, reports, and 'today' on the dashboard use your local clock. Pick the city closest to where you actually do business — not where Pallio's servers live."
          >
            <Select defaultValue="africa-lagos">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="africa-lagos">Africa / Lagos (WAT)</SelectItem>
                <SelectItem value="africa-accra">Africa / Accra (GMT)</SelectItem>
                <SelectItem value="africa-nairobi">Africa / Nairobi (EAT)</SelectItem>
                <SelectItem value="africa-johannesburg">Africa / Johannesburg (SAST)</SelectItem>
                <SelectItem value="europe-london">Europe / London</SelectItem>
                <SelectItem value="us-eastern">US Eastern</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Fiscal year start"
            tooltip={
              <>
                The month your accounting year begins. Most Nigerian businesses
                pick <strong>January</strong>. Pallio uses this to group
                "year to date" totals on your profit-and-loss reports.
              </>
            }
          >
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
