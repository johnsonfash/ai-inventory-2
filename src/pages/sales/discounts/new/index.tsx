import * as React from "react"
import { CalendarDays, TicketPercent, Users } from "lucide-react"
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

export default function NewDiscount() {
  const [submitting, setSubmitting] = React.useState(false)
  const [type, setType] = React.useState<"percent" | "flat">("percent")

  return (
    <FormShell
      title="New discount code"
      description="Create a redeemable code applied at checkout."
      backHref="/sales/discounts"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Code", body: "Short codes redeem better (SUMMER20 vs SUMMER-DEAL-2026).", Icon: TicketPercent },
            { title: "Cap", body: "Set a global cap so a viral promo can't bleed margin uncontrollably.", Icon: Users },
            { title: "Schedule", body: "Leave dates blank to keep the code live indefinitely.", Icon: CalendarDays },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save discount" submitting={submitting} cancelHref="/sales/discounts" />}
    >
      <FormSection title="Code" Icon={TicketPercent}>
        <FormGrid cols={3}>
          <FormField label="Code" required hint="Customers type this at checkout.">
            <Input placeholder="SUMMER20" required />
          </FormField>
          <FormField label="Type" required>
            <Select value={type} onValueChange={(v) => v && setType(v as "percent" | "flat")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent off</SelectItem>
                <SelectItem value="flat">Flat amount</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={type === "percent" ? "Percent" : "Amount"} required>
            <InputAddon leading={type === "flat" ? "$" : undefined} trailing={type === "percent" ? "%" : undefined}>
              <input type="number" step={type === "percent" ? "1" : "0.01"} placeholder="0" required />
            </InputAddon>
          </FormField>
          <FormField label="Description" span={3} hint="Internal note.">
            <Textarea placeholder="Summer launch — 20% off everything." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Limits" Icon={Users}>
        <FormGrid cols={3}>
          <FormField label="Total redemption cap" hint="Leave blank for unlimited.">
            <Input type="number" placeholder="500" />
          </FormField>
          <FormField label="Per customer">
            <Input type="number" defaultValue={1} />
          </FormField>
          <FormField label="Minimum order">
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" />
            </InputAddon>
          </FormField>
          <FormField label="Audience">
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                <SelectItem value="new">New customers only</SelectItem>
                <SelectItem value="vip">VIP tier</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Applies to">
            <Select defaultValue="cart">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cart">Entire cart</SelectItem>
                <SelectItem value="category">Specific category</SelectItem>
                <SelectItem value="brand">Specific brand</SelectItem>
                <SelectItem value="sku">Specific SKU</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Schedule" Icon={CalendarDays}>
        <FormGrid cols={2}>
          <FormField label="Starts">
            <Input type="datetime-local" />
          </FormField>
          <FormField label="Ends">
            <Input type="datetime-local" />
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Combine with other discounts"
              description="Allow stacking with automatic price-list discounts."
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
