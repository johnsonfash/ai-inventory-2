import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Props = {
  label: React.ReactNode
  description?: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (next: boolean) => void
  disabled?: boolean
  className?: string
}

// Settings-row pattern: label + description on the left, switch right.
// Use inside FormSection when a field is a toggle.
export function SwitchField({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: Props) {
  const id = React.useId()
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3",
        className,
      )}
    >
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <div className="text-sm font-medium text-foreground/90">{label}</div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </label>
      <Switch
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
