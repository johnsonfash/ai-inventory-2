import * as React from "react"
import { Layers, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormShell } from "@/components/forms/form-shell"
import { FormSection } from "@/components/forms/form-section"
import { FormGrid } from "@/components/forms/form-grid"
import { FormField } from "@/components/forms/form-field"
import { FormFooter } from "@/components/forms/form-footer"
import { FormAside } from "@/components/forms/form-aside"

export default function NewCategory() {
  const [submitting, setSubmitting] = React.useState(false)
  return (
    <FormShell
      title="New category"
      description="Categories group items in the catalog, POS, reports, and ads."
      backHref="/inventory/categories"
      onSubmit={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 400) }}
      aside={
        <FormAside
          tips={[
            { title: "Hierarchy", body: "Pick a parent to nest this under another category. Leave blank for a top-level.", Icon: Layers },
            { title: "Naming", body: "Use clear nouns. Avoid abbreviations; reports + ad feeds use these labels verbatim.", Icon: Tag },
          ]}
        />
      }
      footer={<FormFooter submitLabel="Save category" submitting={submitting} cancelHref="/inventory/categories" />}
    >
      <FormSection title="Basics" description="Identity and parent" Icon={Tag}>
        <FormGrid cols={2}>
          <FormField label="Name" required>
            <Input placeholder="Electronics" required />
          </FormField>
          <FormField label="Parent category" hint="Leave blank for a top-level category.">
            <Select>
              <SelectTrigger><SelectValue placeholder="(top-level)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description" span={2}>
            <Textarea placeholder="What kinds of products belong here?" />
          </FormField>
        </FormGrid>
      </FormSection>
    </FormShell>
  )
}
