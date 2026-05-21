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
      titleTooltip={
        <>
          Create a customer record so Pallio remembers their contact,
          payment terms, and price-list tier the next time they buy.
          For one-off walk-ins, you can skip this and the POS will
          tag the sale as "Walk-in" automatically.
        </>
      }
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
          <FormField
            label="Name"
            required
            hint="Business name or contact full name."
            tooltip="If this is a business, use the company name. If it's a walk-in shopper, use their full name. Pallio uses this everywhere — invoices, receipts, search results."
          >
            <Input placeholder="NovaApps" required />
          </FormField>
          <FormField
            label="Customer type"
            tooltip={
              <>
                <ul className="space-y-1.5">
                  <li><strong>Retail</strong> — walk-in shoppers paying the listed price.</li>
                  <li><strong>Wholesale</strong> — business buyers who get bulk prices + payment terms.</li>
                  <li><strong>Online</strong> — customers who order through your website.</li>
                </ul>
                Pallio uses this to pick the right price list and tax treatment automatically.
              </>
            }
          >
            <Select defaultValue="retail">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Email" required tooltip="Where invoices, receipts, and order confirmations are sent.">
            <Input type="email" placeholder="ops@novaapps.io" required />
          </FormField>
          <FormField label="Phone" tooltip="Used for WhatsApp / SMS receipts and delivery updates.">
            <Input type="tel" placeholder="+234 803 555 0123" />
          </FormField>
          <FormField
            label="Tax ID / VAT"
            hint="For B2B invoicing."
            tooltip="The customer's TIN or VAT number. Required on B2B invoices so they can reclaim tax on their side. Leave blank for walk-in retail."
          >
            <Input placeholder="12345678-0001" />
          </FormField>
          <FormField
            label="Notes"
            span={2}
            tooltip="Anything you want to remember about this customer — preferences, allergies, credit history. Visible only to your team, never to the customer."
          >
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
          <FormField
            label="Default price list"
            tooltip={
              <>
                Which set of prices to use when this customer buys.
                <strong> Retail</strong> = listed price, <strong>Wholesale</strong>{" "}
                = bulk-discount price, <strong>VIP</strong> = a special tier you
                define for top customers. Set up price lists in Inventory →
                Price lists.
              </>
            }
          >
            <Select defaultValue="retail">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="Payment terms"
            tooltip={
              <>
                How long the customer has to pay you.
                <ul className="mt-1.5 list-disc pl-4">
                  <li><strong>Immediate</strong> — pay at the till (cash, card, transfer).</li>
                  <li><strong>Net 7 / 14 / 30</strong> — pay within that many days of the invoice date.</li>
                </ul>
                Used to calculate the invoice due date automatically.
              </>
            }
          >
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
              description="When an order ships, Pallio emails the invoice + payment link to the customer without you lifting a finger."
              defaultChecked
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
