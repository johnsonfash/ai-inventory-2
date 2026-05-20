import { ArrowLeftRight, CalendarDays, KeyRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function CalendarConfig() {
  return (
    <IntegrationShell
      name="Calendar sync"
      category="Productivity"
      description="Two-way sync Pallio appointments with Google Calendar or Outlook."
      Icon={CalendarDays}
      tone="emerald"
      status="available"
      docsHref="https://developers.google.com/calendar"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="Provider" Icon={CalendarDays}>
        <FormGrid cols={2}>
          <FormField label="Calendar provider" required>
            <Select defaultValue="google">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                <SelectItem value="apple">iCloud Calendar</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Account email" required>
            <Input type="email" placeholder="you@example.com" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="OAuth (optional override)" description="Use your own app credentials" Icon={KeyRound}>
        <FormGrid cols={2}>
          <FormField label="Client ID">
            <Input placeholder="…apps.googleusercontent.com" />
          </FormField>
          <FormField label="Client secret">
            <Input type="password" placeholder="GOCSPX-…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Sync direction" Icon={ArrowLeftRight}>
        <FormGrid cols={1}>
          <FormField label="Direction">
            <Select defaultValue="two-way">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pallio-to-cal">Pallio → Calendar only</SelectItem>
                <SelectItem value="cal-to-pallio">Calendar → Pallio only</SelectItem>
                <SelectItem value="two-way">Two-way</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <SwitchField label="Include cancelled appointments" description="Mirror cancellations in the connected calendar." defaultChecked />
          <SwitchField label="Show customer name in event title" description="Otherwise titles are generic ('Appointment')." defaultChecked />
        </FormGrid>
      </FormSection>
    </IntegrationShell>
  )
}
