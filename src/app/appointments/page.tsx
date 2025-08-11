"use client"

import * as React from "react"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

function buildMonth(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = new Date(d)
  start.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // start on Monday
  return Array.from({ length: 42 }).map((_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

export default function Appointments() {
  const [refDate, setRefDate] = React.useState(new Date())
  const days = buildMonth(refDate)
  const monthLabel = refDate.toLocaleString(undefined, { month: "long", year: "numeric" })
  const sameMonth = (d: Date) => d.getMonth() === refDate.getMonth()

  return (
    <PageShell title="Appointments" withToolbar={false}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Schedule and manage appointments</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1))}
              >
                Prev
              </Button>
              <div className="min-w-[160px] text-center font-medium">{monthLabel}</div>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className={`min-h-[90px] rounded-md border p-2 text-sm ${sameMonth(d) ? "" : "opacity-50"}`}
              >
                <div className="mb-1 text-xs">{d.getDate()}</div>
                {/* Example appointment pill */}
                {d.getDate() === 15 && sameMonth(d) ? (
                  <div className="mt-1 rounded bg-violet-600/10 px-2 py-1 text-[11px] text-violet-700 dark:text-violet-300">
                    Client call — 3:30pm
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Title" />
            <Input placeholder="Date (YYYY-MM-DD)" />
            <Button className="bg-violet-600 hover:bg-violet-600/90">Add Appointment</Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
