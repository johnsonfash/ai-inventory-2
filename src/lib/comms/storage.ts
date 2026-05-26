import { kvJson } from "@/lib/storage/kv"
import type { EmailTemplate } from "./types"
import { TEMPLATES } from "./data"

// User-created / edited email templates, persisted to kv. Builtin
// templates (lib/comms/data.ts) can't be deleted — editing one creates
// an editable user copy (clone), matching Mailchimp/Klaviyo/Postmark.
// Backend will replace this kv layer with /communications/templates CRUD.

const KEY = "pallio:comms:user-templates:v1"
export const TEMPLATES_CHANGED = "pallio:comms-templates-changed"

export function loadUserTemplates(): EmailTemplate[] {
  return kvJson.get<EmailTemplate[]>(KEY) ?? []
}

// User templates first (most-recently-saved on top), then the builtins.
export function loadAllTemplates(): EmailTemplate[] {
  return [...loadUserTemplates(), ...TEMPLATES]
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return loadAllTemplates().find((t) => t.id === id)
}

export function saveUserTemplate(tpl: EmailTemplate): void {
  const list = loadUserTemplates()
  const next: EmailTemplate = { ...tpl, builtin: false }
  const idx = list.findIndex((t) => t.id === tpl.id)
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  void kvJson.set(KEY, list)
  window.dispatchEvent(new CustomEvent(TEMPLATES_CHANGED))
}

export function deleteUserTemplate(id: string): void {
  void kvJson.set(KEY, loadUserTemplates().filter((t) => t.id !== id))
  window.dispatchEvent(new CustomEvent(TEMPLATES_CHANGED))
}

export function newTemplateId(): string {
  return `tpl-user-${Date.now().toString(36)}`
}

// Scan subject + body for {{tokens}} and produce the variable list.
// Reuses prior {label, sample} for tokens that already existed so an
// edit doesn't wipe the samples used in the live preview.
export function deriveTokens(
  subject: string,
  body: string,
  existing: EmailTemplate["tokens"] = [],
): EmailTemplate["tokens"] {
  const found: string[] = []
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
  for (const text of [subject, body]) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      if (!found.includes(m[1]!)) found.push(m[1]!)
    }
  }
  return found.map((key) => {
    const prior = existing.find((t) => t.key === key)
    if (prior) return prior
    return {
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      sample: "",
    }
  })
}
