"use client"

import { Bell } from "lucide-react"

type Notification = {
  id: string
  title: string
  description?: string
  time: string
  level?: "info" | "warning" | "error" | "success"
}

const samples: Notification[] = [
  {
    id: "n1",
    title: "Low stock for EL-2109",
    description: "On-hand 12 below reorder point 25",
    time: "2m ago",
    level: "warning",
  },
  { id: "n2", title: "PO-1045 received", description: "20 units added to stock", time: "1h ago", level: "success" },
  { id: "n3", title: "Invoice INV-3310 unpaid", description: "Due date in 3 days", time: "3h ago", level: "error" },
  { id: "n4", title: "System update", description: "New analytics reports available", time: "1d ago", level: "info" },
]

export function NotificationList({ items = samples }: { items?: Notification[] }) {
  const color = (lvl?: Notification["level"]) =>
    lvl === "warning"
      ? "text-amber-600"
      : lvl === "error"
        ? "text-red-600"
        : lvl === "success"
          ? "text-emerald-600"
          : "text-muted-foreground"
  return (
    <ul className="divide-y">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-3 py-3">
          <Bell className={`mt-0.5 h-4 w-4 ${color(n.level)}`} />
          <div className="min-w-0">
            <div className="truncate font-medium">{n.title}</div>
            {n.description ? <div className="text-sm text-muted-foreground">{n.description}</div> : null}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">{n.time}</div>
        </li>
      ))}
    </ul>
  )
}
