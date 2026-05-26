import { TemplateEditor } from "../template-editor"

// /communications/templates/new — blank editor, or a clone when a
// ?from=<id> query is present (used by the "Clone" action on builtins).
export default function NewTemplatePage() {
  return <TemplateEditor />
}
