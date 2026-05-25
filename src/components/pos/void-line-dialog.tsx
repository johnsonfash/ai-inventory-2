import * as React from "react"
import { Trash2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VOID_REASONS, type VoidReason } from "@/lib/pos/settings"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

export type VoidTarget = { sku: string; name: string; value: number }

// Captures WHY a line is being removed so it differs from a typo in the
// audit trail. Shown before the line leaves the cart; the parent decides
// whether a high-value void also needs manager approval afterward. POS-1.
export function VoidLineDialog({
  target,
  onConfirm,
  onClose,
}: {
  target: VoidTarget | null
  onConfirm: (reason: VoidReason, note?: string) => void
  onClose: () => void
}) {
  const { formatPrice } = useCurrency()
  const [reason, setReason] = React.useState<VoidReason>("mistake")
  const [note, setNote] = React.useState("")

  React.useEffect(() => {
    setReason("mistake")
    setNote("")
  }, [target])

  if (!target) return null

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold">Remove line</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {target.name} · {formatPrice(target.value)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-muted-foreground">Reason</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {VOID_REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                reason === r.value
                  ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {reason === "other" && (
          <Input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
            className="mt-3"
          />
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Keep
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm(reason, note.trim() || undefined)
              onClose()
            }}
          >
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
