import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency"
import { cn } from "@/lib/utils"

export type QuickDiscount = {
  code: string
  type: "percent" | "flat"
  value: number
  cap?: number
}

// Quick-add discount code. The common case is code + type + value; caps,
// schedules and audience rules live on the full /sales/discounts/new page
// behind "More details". Drawer on mobile, centred modal on desktop.
export function AddDiscountDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (d: QuickDiscount) => void
}) {
  const navigate = useNavigate()
  const { symbol } = useCurrency()
  const [code, setCode] = React.useState("")
  const [type, setType] = React.useState<QuickDiscount["type"]>("percent")
  const [value, setValue] = React.useState("")
  const [cap, setCap] = React.useState("")

  const numericValue = Math.max(0, Number(value) || 0)
  const valid = code.trim().length > 0 && numericValue > 0

  React.useEffect(() => {
    if (!open) return
    setCode("")
    setType("percent")
    setValue("")
    setCap("")
  }, [open])

  const submit = () => {
    if (!valid) return
    const capNum = Number(cap)
    onCreate({
      code: code.trim().toUpperCase(),
      type,
      value: numericValue,
      cap: cap.trim() && capNum > 0 ? capNum : undefined,
    })
    toast.success("Discount created", { description: code.trim().toUpperCase() })
    onClose()
  }

  const openFull = () => {
    onClose()
    navigate("/sales/discounts/new")
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="New discount code"
      description="A code customers type at checkout. Schedule + audience rules under More details."
      maxHeightVh={82}
      footer={
        <div className="flex items-center justify-between gap-2 pb-3">
          <button
            type="button"
            onClick={openFull}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline dark:text-primary"
          >
            More details <ArrowRight className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={submit} disabled={!valid}>Create code</Button>
          </div>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex flex-col gap-3 pb-1"
      >
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Code</span>
          <Input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SAVE10"
            className="font-mono uppercase"
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Type</span>
            <div className="inline-flex rounded-lg border border-input p-0.5">
              {(["percent", "flat"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                    type === t ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  {t === "percent" ? "% off" : `${symbol} off`}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-semibold text-foreground/80">Value</span>
            <div className="relative">
              {type === "flat" && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{symbol}</span>
              )}
              <Input
                type="number"
                step={type === "percent" ? "1" : "0.01"}
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percent" ? "10" : "500"}
                className={cn(type === "flat" ? "pl-7" : "pr-7")}
                required
              />
              {type === "percent" && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              )}
            </div>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs">
          <span className="font-semibold text-foreground/80">Redemption cap <span className="font-normal text-muted-foreground">(optional)</span></span>
          <Input
            type="number"
            min={0}
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            placeholder="Leave blank for unlimited"
          />
        </label>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </BottomSheet>
  )
}
