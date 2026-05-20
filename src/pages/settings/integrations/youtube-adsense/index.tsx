import { DollarSign, KeyRound, Youtube } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { SwitchField } from "@/components/forms/switch-field"
import { IntegrationShell } from "@/components/settings/integration-shell"

export default function YoutubeAdsenseConfig() {
  return (
    <IntegrationShell
      name="YouTube & AdSense"
      category="Marketing"
      description="Track affiliate placements and AdSense earnings from your monetised channels."
      Icon={Youtube}
      tone="rose"
      status="available"
      docsHref="https://developers.google.com/youtube/v3"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="button">Connect</Button>
        </div>
      }
    >
      <FormSection title="YouTube channel" Icon={Youtube}>
        <FormGrid cols={2}>
          <FormField label="Channel ID" required>
            <Input placeholder="UC…" />
          </FormField>
          <FormField label="API key" required>
            <Input type="password" placeholder="AIza…" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="AdSense" Icon={DollarSign}>
        <FormGrid cols={2}>
          <FormField label="Publisher ID">
            <Input placeholder="pub-1234567890123456" />
          </FormField>
          <FormField label="Property URL" hint="Used for revenue attribution.">
            <Input placeholder="https://acme.com" />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Behaviour" Icon={KeyRound}>
        <SwitchField label="Pull weekly revenue" description="Refresh AdSense numbers every Monday." defaultChecked />
        <SwitchField label="Include in commissions report" description="Roll affiliate earnings into the marketing-team commissions page." />
      </FormSection>
    </IntegrationShell>
  )
}
