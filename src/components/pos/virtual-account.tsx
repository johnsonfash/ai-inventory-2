"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { listLocations, listCashiersForLocation, findVirtualAccount } from "@/src/lib/payments/virtual-accounts"

export function VirtualAccountPanel({
  location,
  cashier,
  onLocationChange,
  onCashierChange,
}: {
  location: string
  cashier: string
  onLocationChange: (loc: string) => void
  onCashierChange: (c: string) => void
}) {
  const locations = listLocations()
  const cashiers = listCashiersForLocation(location)
  const va = findVirtualAccount(location, cashier)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Register & Virtual Account</CardTitle>
        <CardDescription>Select cashier and view VA details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block text-sm">
          <span className="text-muted-foreground">Location</span>
          <select
            className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-muted-foreground">Cashier</span>
          <select
            className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={cashier}
            onChange={(e) => onCashierChange(e.target.value)}
          >
            {cashiers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {va ? (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            <div className="font-medium">Virtual Account</div>
            <div className="text-muted-foreground">{va.bank}</div>
            <div className="font-mono text-xs">{va.accountNumber}</div>
            <div className="text-muted-foreground">{va.accountName}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No VA found for selection.</div>
        )}
      </CardContent>
    </Card>
  )
}
