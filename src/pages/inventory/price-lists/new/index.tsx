import * as React from "react"
import { DollarSign, TagsIcon, Users } from "lucide-react"
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
import { InputAddon } from "@/components/forms/input-addon"

type Basis = "cost+" | "msrp-" | "fixed"

export default function NewPriceList() {
  const [submitting, setSubmitting] = React.useState(false)
  const [basis, setBasis] = React.useState<Basis>("msrp-")

  return (
    <FormShell
      title="New price list"
      description="Define a pricing rule that applies to a customer audience or channel."
      titleTooltip={
        <>
          A named set of overrides on top of the default retail price.
          Wholesale customers see one list, VIPs another, the online
          storefront a third. Pallio picks the right list per customer
          + channel automatically.
        </>
      }
      backHref="/inventory/price-lists"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Basis", body: "MSRP − % is most common. Use Cost + % for B2B/staff. Use Fixed for per-item overrides.", Icon: TagsIcon },
            { title: "Audience", body: "Auto-applies based on customer tier or channel. Manual override is always possible at checkout.", Icon: Users },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save price list" submitting={submitting} cancelHref="/inventory/price-lists" />}
    >
      <FormSection title="Identity" Icon={TagsIcon}>
        <FormGrid cols={2}>
          <FormField label="Name" required>
            <Input placeholder="Wholesale" required />
          </FormField>
          <FormField label="Audience">
            <Select defaultValue="wholesale">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail (default)</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="vip">VIP / loyalty</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description" span={2}>
            <Textarea placeholder="Internal notes — not shown to customers." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Rule" description="How items are priced" Icon={DollarSign}>
        <FormGrid cols={3}>
          <FormField label="Basis">
            <Select value={basis} onValueChange={(v) => v && setBasis(v as Basis)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="msrp-">MSRP minus %</SelectItem>
                <SelectItem value="cost+">Cost plus %</SelectItem>
                <SelectItem value="fixed">Fixed (per-item)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          {basis !== "fixed" && (
            <FormField label={basis === "msrp-" ? "Discount %" : "Markup %"}>
              <InputAddon trailing="%">
                <input type="number" defaultValue={basis === "msrp-" ? 35 : 25} step="0.1" />
              </InputAddon>
            </FormField>
          )}
          <FormField label="Round to">
            <Select defaultValue="cent">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cent">Nearest cent</SelectItem>
                <SelectItem value="99">.99 endings</SelectItem>
                <SelectItem value="00">Whole dollars</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={Users}>
        <SwitchField label="Active" description="Inactive price lists are hidden everywhere." defaultChecked />
        <SwitchField label="Combine with discount codes" description="Allow stackable discount codes on top of this list." />
        <SwitchField label="Sticky" description="Once applied to a customer, this list stays applied across visits." defaultChecked />
      </FormSection>
    </FormShell>
  )
}
