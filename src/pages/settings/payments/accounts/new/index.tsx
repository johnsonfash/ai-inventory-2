import * as React from "react"
import { Banknote, Building2, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"
import { useCurrency, formatPriceFor } from "@/contexts/currency"

export default function NewWithdrawalAccount() {
  const [submitting, setSubmitting] = React.useState(false)
  const { formatPrice } = useCurrency()
  return (
    <FormShell
      title="New withdrawal account"
      description="Where Pallio sends a location or cashier's revenue."
      backHref="/settings/payments/accounts"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 500) }}
      aside={
        <FormAside
          tips={[
            { title: "Verification", body: `We'll send a ${formatPriceFor(0)} test deposit before letting payouts hit this account.`, Icon: ShieldCheck },
            { title: "Per-cashier", body: "Use this to split takings across cash drawers — common in pop-ups + markets.", Icon: Banknote },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Add account" submitting={submitting} cancelHref="/settings/payments/accounts" />}
    >
      <FormSection title="Bank" Icon={Building2}>
        <FormGrid cols={2}>
          <FormField label="Bank name" required>
            <Input placeholder="Mercury Bank" required />
          </FormField>
          <FormField label="Account name (on bank)" required>
            <Input placeholder="Pallio Ops — Austin" required />
          </FormField>
          <FormField label="Account number" required>
            <Input placeholder="0321 4482 1023" required />
          </FormField>
          <FormField label="Routing / sort code">
            <Input placeholder="011000138" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Assignment" Icon={Banknote}>
        <FormGrid cols={2}>
          <FormField label="Location">
            <Select defaultValue="downtown">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="downtown">Downtown Austin</SelectItem>
                <SelectItem value="east">East DC</SelectItem>
                <SelectItem value="west">West Hub</SelectItem>
                <SelectItem value="hq">HQ — Operations</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Cashier">
            <Select defaultValue="any">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any cashier (location-wide)</SelectItem>
                <SelectItem value="mia">Mia Chen</SelectItem>
                <SelectItem value="alex">Alex Larson</SelectItem>
                <SelectItem value="priya">Priya Patel</SelectItem>
                <SelectItem value="daniel">Daniel Kim</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={ShieldCheck}>
        <SwitchField label="Auto-payout" description="Sweep balance to this account daily at 5pm." defaultChecked />
        <SwitchField label={`Require manager approval over ${formatPrice(5000)}`} />
      </FormSection>
    </FormShell>
  )
}
