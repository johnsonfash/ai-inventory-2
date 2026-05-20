import { KeyRound, Mail, ShieldCheck, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function GoogleWorkspaceConfig() {
  return (
    <IntegrationShell
      name="Google Workspace"
      category="Productivity"
      description="Single sign-on, Gmail sending, and Drive document attachments."
      Icon={Mail}
      tone="violet"
      status="connected"
      lastSynced="just now"
      docsHref="https://developers.google.com/workspace"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Disconnect</Button>
          <Button type="button">Save changes</Button>
        </div>
      }
    >
      <FormSection title="OAuth client" description="Created in Google Cloud Console" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Client ID" required>
            <Input placeholder="…apps.googleusercontent.com" defaultValue="724819…apps.googleusercontent.com" />
          </FormField>
          <FormField label="Client secret" required>
            <Input type="password" placeholder="GOCSPX-…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Sign-in restriction" Icon={ShieldCheck}>
        <FormGrid cols={2}>
          <FormField label="Allowed domain" hint="Only this domain can sign in via SSO. Leave blank for any.">
            <Input placeholder="acme.com" defaultValue="acme.com" />
          </FormField>
          <FormField label="Default role for new users">
            <Input defaultValue="Manager" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Capabilities" Icon={Users}>
        <SwitchField label="Sign in with Google" description="Show the Sign in with Google button on the auth screen." defaultChecked />
        <SwitchField label="Send invoices via Gmail" description="Pallio sends customer invoices through your Gmail outbox." defaultChecked />
        <SwitchField label="Attach to Drive" description="Save invoice + receipt PDFs to a shared Drive folder." />
      </FormSection>
    </IntegrationShell>
  )
}
