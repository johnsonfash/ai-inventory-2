import { kvJson } from "@/lib/storage/kv"
import { genId, type CartItem } from "@/lib/pos/storage"

// POS-4: generic "venue" primitives. A Venue is a physical layout; a Spot
// is a unit within it. The SAME model serves every industry — only the
// label changes per business mode (see spotNoun). Never ship a vertical
// "restaurant module"; the restaurant profile just relabels these.
//   restaurant → Tables   salon → Chairs   mechanic → Bays
//   bar → Stools          repair → Benches  hotel → Rooms
//
// An Open Order is a tab that accumulates items over time and can be
// "fired" (sent to the prep queue) in stages. Different from a Draft
// (paused cart) and an Invoice (finalised sale).

export type SpotStatus = "open" | "seated" | "busy" | "reserved" | "closed"

export type Spot = {
  id: string
  label: string
  capacity?: number
  status: SpotStatus
}

export type Venue = {
  id: string
  name: string
  spots: Spot[]
}

export type PrepStatus = "queued" | "in-progress" | "ready" | "served"

export type OrderEvent = {
  at: number
  type: "open" | "add" | "fire" | "pay" | "note"
  detail?: string
  /** Stage fired, when type === "fire". */
  stage?: string
}

// An open-order line is a cart line plus prep metadata. Reuses CartItem so
// it can move straight into the checkout cart when settled.
export type OrderLine = CartItem & {
  /** Course / stage label or number ("starters", "1", "shampoo"). */
  stage?: string
  prepStatus?: PrepStatus
  firedAt?: number
}

export type OpenOrder = {
  id: string
  venueId?: string
  spotId?: string
  label?: string
  customer?: { name?: string; email?: string; phone?: string } | null
  lines: OrderLine[]
  events: OrderEvent[]
  status: "open" | "held" | "paid"
  createdAt: number
  updatedAt: number
}

type Mode = "retail" | "restaurant" | "services" | "auto"

// Industry-aware labels (singular, plural, verb for "seat/assign").
export function spotNoun(mode: Mode): { one: string; many: string; layout: string } {
  switch (mode) {
    case "restaurant":
      return { one: "Table", many: "Tables", layout: "Floor" }
    case "services":
      return { one: "Chair", many: "Chairs", layout: "Salon" }
    case "auto":
      return { one: "Bay", many: "Bays", layout: "Workshop" }
    default:
      return { one: "Spot", many: "Spots", layout: "Layout" }
  }
}

export function prepNoun(mode: Mode): string {
  switch (mode) {
    case "restaurant":
      return "Kitchen"
    case "services":
      return "Stylist queue"
    case "auto":
      return "Service queue"
    default:
      return "Prep queue"
  }
}

// ---------------- Venue storage ----------------

const VENUE_KEY = "pos:venue:v1"
const OPEN_ORDERS_KEY = "pos:open-orders:v1"

export function loadVenue(): Venue {
  const stored = kvJson.get<Venue>(VENUE_KEY)
  if (stored) return stored
  // Seed a simple layout so the page isn't empty on first open.
  const seeded: Venue = {
    id: "venue-1",
    name: "Main floor",
    spots: [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `spot-${i + 1}`,
        label: `${i + 1}`,
        capacity: i < 4 ? 2 : 4,
        status: "open" as SpotStatus,
      })),
    ],
  }
  void kvJson.set(VENUE_KEY, seeded)
  return seeded
}

export function saveVenue(v: Venue) {
  void kvJson.set(VENUE_KEY, v)
}

export function setSpotStatus(spotId: string, status: SpotStatus) {
  const v = loadVenue()
  const spot = v.spots.find((s) => s.id === spotId)
  if (spot) spot.status = status
  saveVenue(v)
}

// ---------------- Open orders ----------------

export function listOpenOrders(): OpenOrder[] {
  return kvJson.get<OpenOrder[]>(OPEN_ORDERS_KEY) ?? []
}
function saveOpenOrders(list: OpenOrder[]) {
  void kvJson.set(OPEN_ORDERS_KEY, list)
}
export function getOpenOrder(id: string): OpenOrder | undefined {
  return listOpenOrders().find((o) => o.id === id)
}
export function openOrderForSpot(spotId: string): OpenOrder | undefined {
  return listOpenOrders().find((o) => o.spotId === spotId && o.status !== "paid")
}

export function upsertOpenOrder(order: OpenOrder) {
  const list = listOpenOrders()
  const idx = list.findIndex((o) => o.id === order.id)
  order.updatedAt = Date.now()
  if (idx >= 0) list[idx] = order
  else list.unshift(order)
  saveOpenOrders(list)
}

export function createOpenOrder(opts: { venueId?: string; spotId?: string; label?: string }): OpenOrder {
  const order: OpenOrder = {
    id: genId("ord"),
    venueId: opts.venueId,
    spotId: opts.spotId,
    label: opts.label,
    lines: [],
    events: [{ at: Date.now(), type: "open" }],
    status: "open",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  upsertOpenOrder(order)
  if (opts.spotId) setSpotStatus(opts.spotId, "seated")
  return order
}

export function closeOpenOrder(id: string) {
  const list = listOpenOrders()
  const order = list.find((o) => o.id === id)
  if (order?.spotId) setSpotStatus(order.spotId, "open")
  saveOpenOrders(list.filter((o) => o.id !== id))
}

// ---------------- Prep queue ----------------

// The prep queue is derived: every fired line across all open orders that
// isn't served yet. Returned with its order context for the KDS page.
export type PrepTicket = {
  orderId: string
  spotLabel?: string
  line: OrderLine
}

export function prepQueue(): PrepTicket[] {
  const tickets: PrepTicket[] = []
  for (const o of listOpenOrders()) {
    for (const line of o.lines) {
      if (line.firedAt && line.prepStatus && line.prepStatus !== "served") {
        tickets.push({ orderId: o.id, spotLabel: o.label || o.spotId, line })
      }
    }
  }
  return tickets.sort((a, b) => (a.line.firedAt ?? 0) - (b.line.firedAt ?? 0))
}

export function setLinePrepStatus(orderId: string, lineId: string, status: PrepStatus) {
  const list = listOpenOrders()
  const order = list.find((o) => o.id === orderId)
  if (!order) return
  const line = order.lines.find((l) => l.id === lineId)
  if (line) line.prepStatus = status
  order.updatedAt = Date.now()
  saveOpenOrders(list)
}

// Fire a stage (or all unfired lines): stamp firedAt + prepStatus, push an
// event. Returns the number of lines fired.
export function fireStage(orderId: string, stage?: string): number {
  const list = listOpenOrders()
  const order = list.find((o) => o.id === orderId)
  if (!order) return 0
  let fired = 0
  for (const line of order.lines) {
    if (line.firedAt) continue
    if (stage != null && line.stage !== stage) continue
    line.firedAt = Date.now()
    line.prepStatus = "queued"
    fired++
  }
  if (fired > 0) order.events.push({ at: Date.now(), type: "fire", stage })
  order.updatedAt = Date.now()
  saveOpenOrders(list)
  return fired
}
