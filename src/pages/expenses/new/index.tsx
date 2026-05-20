import * as React from "react"
import { Paperclip, Receipt, Tag } from "lucide-react"
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

export default function NewExpense() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="Record expense"
      description="Operating cost entry — affects the P&L immediately."
      backHref="/expenses"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 500)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Receipts", body: "Attach a receipt photo or PDF for tax season exports.", Icon: Paperclip },
            { title: "Category", body: "Categories appear in the Expenses report. Add new ones in Settings.", Icon: Tag },
            { title: "Reimbursable", body: "Flag to track expenses owed back to staff.", Icon: Receipt },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save expense" submitting={submitting} cancelHref="/expenses" />}
    >
      <FormSection title="Details" description="What was the spend?" Icon={Receipt}>
        <FormGrid cols={3}>
          <FormField label="Category" required>
            <Select defaultValue="logistics">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Vendor / payee">
            <Input placeholder="DHL" />
          </FormField>
          <FormField label="Date" required>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
          </FormField>
          <FormField label="Amount" required>
            <InputAddon leading="$">
              <input type="number" step="0.01" placeholder="0.00" required />
            </InputAddon>
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
          <FormField label="Payment method">
            <Select defaultValue="card">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Bank transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description" span={3} hint="Optional. Shows in the activity log.">
            <Textarea placeholder="Express shipping for PO-1042." />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Receipt" Icon={Paperclip}>
        <FormGrid cols={1}>
          <FormField label="Attach receipt" hint="PNG, JPG, or PDF — max 8MB.">
            <Input type="file" accept="image/*,application/pdf" />
          </FormField>
          <FormField>
            <SwitchField
              label="Reimbursable expense"
              description="Track this as owed to an employee."
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
