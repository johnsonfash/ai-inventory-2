import type { Invite, Location, Member, Role, RoleKey, Session } from "./types"

// Locations the rest of the team-management surface attributes to.
// Aligns with the mock locations used by /settings/warehouses, the
// POS, and the dummy reporting data.
export const LOCATIONS: Location[] = [
  { id: "wh-a",     name: "Warehouse A",      city: "Austin" },
  { id: "downtown", name: "Downtown Store",   city: "Austin" },
  { id: "east-dc",  name: "East DC",          city: "Atlanta" },
  { id: "west-hub", name: "West Hub",         city: "Portland" },
  { id: "sxsw",     name: "SXSW Popup",       city: "Austin" },
]

// Role catalogue. Owners can't be deleted; affiliates are external.
// Permissions are coarse — fine-grained scopes are in /settings/roles.
export const ROLES: Role[] = [
  {
    key: "owner",
    name: "Owner",
    tagline: "Founders + business owners. Uncapped admin.",
    description: "Full access to every surface, including billing and the team management page itself. There can be more than one Owner — Pallio doesn't enforce a single-owner model.",
    tone: "brand",
    permissions: {
      inventory: "write", pos: "void", purchasing: "write",
      reporting: "export", marketing: "manage", team: "manage", settings: "billing",
    },
  },
  {
    key: "manager",
    name: "Manager",
    tagline: "Location admin — everything except billing + team.",
    description: "Runs the floor. Can edit catalog, run POS, void sales, manage purchasing + receiving, send marketing campaigns, view reports. Cannot change billing or invite team members.",
    tone: "info",
    permissions: {
      inventory: "write", pos: "void", purchasing: "write",
      reporting: "export", marketing: "manage", team: "read", settings: "manage",
    },
  },
  {
    key: "cashier",
    name: "Cashier",
    tagline: "Point of sale only — no margins, no settings.",
    description: "Runs sales at the register. Can scan, sell, accept payment, print receipts. Cannot see margins, cost prices, or settings. Voids require a manager override.",
    tone: "success",
    permissions: {
      inventory: "read", pos: "use", purchasing: "none",
      reporting: "none", marketing: "none", team: "none", settings: "none",
    },
  },
  {
    key: "sales-rep",
    name: "Sales rep",
    tagline: "Outside / in-store sales — CRM + commissions.",
    description: "Creates customers, quotes, sales orders + invoices. Sees their own commission accrual. Has live read access to inventory across all locations so they can promise availability accurately.",
    tone: "warning",
    permissions: {
      inventory: "read", pos: "use", purchasing: "none",
      reporting: "read", marketing: "none", team: "read", settings: "none",
    },
  },
  {
    key: "marketer",
    name: "Marketer",
    tagline: "Ad surfaces + analytics. No POS or stock control.",
    description: "Owns campaigns across Facebook, Instagram, Marketplace, and YouTube. Manages listings, creatives, and budgets. Can view all reports but cannot run sales or edit stock.",
    tone: "info",
    permissions: {
      inventory: "read", pos: "none", purchasing: "none",
      reporting: "read", marketing: "manage", team: "none", settings: "none",
    },
  },
  {
    key: "affiliate",
    name: "Affiliate",
    tagline: "External partner with a unique referral link.",
    description: "External partners who drive traffic. Get a unique referral code + a dashboard showing their attributed sales + commission. Read-only and scoped to their own attribution.",
    tone: "warning",
    external: true,
    permissions: {
      inventory: "none", pos: "none", purchasing: "none",
      reporting: "read", marketing: "none", team: "none", settings: "none",
    },
  },
  {
    key: "viewer",
    name: "Viewer",
    tagline: "Read-only access — accountants, investors, observers.",
    description: "Sees every page in read-only mode. Cannot create, edit, or delete anything. Used for accountants, investors, or anyone who needs visibility without write access.",
    tone: "neutral",
    permissions: {
      inventory: "read", pos: "none", purchasing: "read",
      reporting: "read", marketing: "read", team: "read", settings: "read",
    },
  },
  {
    key: "custom",
    name: "Custom",
    tagline: "Build your own scope from scratch.",
    description: "Tailor the permission set yourself. Use this when none of the standard roles map cleanly to the responsibilities you want to give the new member.",
    tone: "neutral",
    permissions: {
      inventory: "none", pos: "none", purchasing: "none",
      reporting: "none", marketing: "none", team: "none", settings: "none",
    },
  },
]

export const ROLE_BY_KEY: Record<RoleKey, Role> = Object.fromEntries(ROLES.map((r) => [r.key, r])) as Record<RoleKey, Role>

// Mock active team — referenced by /settings/users, /settings/users/[id],
// the AI Insights team card, sales/team performance.
export const MEMBERS: Member[] = [
  {
    id: "m-1",
    name: "Mia Chen",
    email: "mia@acme.co",
    role: "manager",
    status: "active",
    locationIds: ["downtown", "wh-a"],
    lastActiveAt: minutesAgoISO(2),
    joinedAt: monthsAgoISO(14),
    mtdSalesUsd: 14_280,
    mtdCommissionUsd: 714,
  },
  {
    id: "m-2",
    name: "Alex Larson",
    email: "alex@acme.co",
    role: "sales-rep",
    status: "active",
    locationIds: ["downtown"],
    lastActiveAt: minutesAgoISO(45),
    joinedAt: monthsAgoISO(8),
    mtdSalesUsd: 11_640,
    mtdCommissionUsd: 582,
  },
  {
    id: "m-3",
    name: "Priya Patel",
    email: "priya@acme.co",
    role: "cashier",
    status: "active",
    locationIds: ["east-dc"],
    lastActiveAt: minutesAgoISO(8),
    joinedAt: monthsAgoISO(6),
    mtdSalesUsd: 4_820,
  },
  {
    id: "m-4",
    name: "Daniel Kim",
    email: "daniel@acme.co",
    role: "marketer",
    status: "active",
    locationIds: [],
    lastActiveAt: minutesAgoISO(180),
    joinedAt: monthsAgoISO(11),
  },
  {
    id: "m-5",
    name: "Jordan Reyes",
    email: "jordan@acme.co",
    role: "viewer",
    status: "active",
    locationIds: [],
    lastActiveAt: minutesAgoISO(60 * 24),
    joinedAt: monthsAgoISO(3),
  },
  {
    id: "m-6",
    name: "Sara Quill",
    email: "sara@quillblog.com",
    role: "affiliate",
    status: "active",
    locationIds: [],
    lastActiveAt: minutesAgoISO(60 * 4),
    joinedAt: monthsAgoISO(2),
    affiliateCode: "QUILL10",
    affiliateClicks: 1_842,
    mtdSalesUsd: 8_410,
    mtdCommissionUsd: 841,
  },
  {
    id: "m-7",
    name: "Lee Park",
    email: "lee@curatedfeed.net",
    role: "affiliate",
    status: "active",
    locationIds: [],
    lastActiveAt: minutesAgoISO(60 * 18),
    joinedAt: monthsAgoISO(4),
    affiliateCode: "LEEPARK",
    affiliateClicks: 942,
    mtdSalesUsd: 3_120,
    mtdCommissionUsd: 312,
  },
  {
    id: "m-8",
    name: "Ben Owens",
    email: "ben@acme.co",
    role: "cashier",
    status: "suspended",
    locationIds: ["sxsw"],
    lastActiveAt: minutesAgoISO(60 * 24 * 14),
    joinedAt: monthsAgoISO(9),
  },
]

// Mock pending invites — shown in the "Pending" tab.
export const INVITES: Invite[] = [
  {
    id: "inv-1",
    email: "kate@acme.co",
    role: "sales-rep",
    locationIds: ["downtown"],
    invitedAt: daysAgoISO(2),
    expiresAt: daysAheadISO(5),
    invitedBy: "Mia Chen",
    token: "tkn_8d3kf9sl",
    note: "Welcome aboard! Hit the ground running with our onboarding checklist.",
  },
  {
    id: "inv-2",
    email: "raymond@bigblog.co",
    role: "affiliate",
    locationIds: [],
    invitedAt: daysAgoISO(0.5),
    expiresAt: daysAheadISO(7),
    invitedBy: "Daniel Kim",
    token: "tkn_v2k4lm9p",
    note: "Excited to partner. 10% on every referred sale.",
  },
  {
    id: "inv-3",
    email: "morgan@acme.co",
    role: "cashier",
    locationIds: ["east-dc"],
    invitedAt: daysAgoISO(5),
    expiresAt: daysAheadISO(2),
    invitedBy: "Mia Chen",
    token: "tkn_xx9pq2yz",
  },
]

// Mock active sessions for the current user (you, Mia) + a couple
// of teammates. /settings/users → Sessions tab consumes this.
export const SESSIONS: Session[] = [
  { id: "s-1", memberId: "m-1", device: "MacBook Pro · Chrome 132",   approxLocation: "Austin, TX",  startedAt: minutesAgoISO(2),       lastSeenAt: minutesAgoISO(0),  current: true },
  { id: "s-2", memberId: "m-1", device: "iPhone 15 · Pallio iOS",     approxLocation: "Austin, TX",  startedAt: minutesAgoISO(300),     lastSeenAt: minutesAgoISO(60), current: false },
  { id: "s-3", memberId: "m-2", device: "iPhone 13 · Pallio iOS",     approxLocation: "Austin, TX",  startedAt: minutesAgoISO(180),     lastSeenAt: minutesAgoISO(45), current: false },
  { id: "s-4", memberId: "m-3", device: "Android · Pallio Android",   approxLocation: "Atlanta, GA", startedAt: minutesAgoISO(720),     lastSeenAt: minutesAgoISO(8),  current: false },
]

// ---- Lookups ----
export function getMemberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id)
}

export function locationsForMember(member: Member): Location[] {
  if (member.locationIds.length === 0) return []
  const set = new Set(member.locationIds)
  return LOCATIONS.filter((l) => set.has(l.id))
}

export function sessionsForMember(memberId: string): Session[] {
  return SESSIONS.filter((s) => s.memberId === memberId)
}

// ---- helpers for fake timestamps ----
function minutesAgoISO(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}
function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}
function daysAheadISO(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}
function monthsAgoISO(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString()
}
