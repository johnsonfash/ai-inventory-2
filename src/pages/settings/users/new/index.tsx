import * as React from "react"
import { Mail, ShieldCheck, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"
import { SwitchField } from "@/components/forms/switch-field"

export default function InviteUser() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <FormShell
      title="Invite user"
      description="Send an invitation email with role and permissions."
      backHref="/settings/users"
      onSubmit={() => {
        setSubmitting(true)
        setTimeout(() => setSubmitting(false), 500)
      }}
      aside={
        <FormAside
          tips={[
            { title: "Roles", body: "Admins can manage everything. Managers can edit POs, items, and team. Viewers are read-only.", Icon: ShieldCheck },
            { title: "Invitation email", body: "Sent immediately. They can finish setup themselves.", Icon: Mail },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Send invite" submitting={submitting} cancelHref="/settings/users" />}
    >
      <FormSection title="Invitee" description="Who you're adding" Icon={UserPlus}>
        <FormGrid cols={2}>
          <FormField label="Full name" required>
            <Input placeholder="Mia Chen" required />
          </FormField>
          <FormField label="Email" required>
            <Input type="email" placeholder="mia@example.com" required />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Access" description="What they can do in Pallio" Icon={ShieldCheck}>
        <FormGrid cols={2}>
          <FormField label="Role" required>
            <Select defaultValue="manager">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier (POS only)</SelectItem>
                <SelectItem value="viewer">Viewer (read-only)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Default location">
            <Select defaultValue="wh-a">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wh-a">Warehouse A</SelectItem>
                <SelectItem value="wh-b">Warehouse B</SelectItem>
                <SelectItem value="wh-c">Warehouse C</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Require two-factor authentication"
              description="Enforce 2FA on first login."
              defaultChecked
            />
          </FormField>
          <FormField span={2}>
            <SwitchField
              label="Send onboarding email"
              description="Include a Pallio tour link in the invitation."
              defaultChecked
            />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
