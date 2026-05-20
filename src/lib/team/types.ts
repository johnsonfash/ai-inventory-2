// Team / staff / affiliates / sessions data shapes. Swap for
// generated OpenAPI types once the backend lands; the existing
// pages depend only on these names.

export type RoleKey =
  | "owner"        // founder / single uncapped admin
  | "manager"      // multi-location admin minus billing
  | "cashier"      // POS only; can't see margins or settings
  | "sales-rep"    // sells + customer CRM, no purchasing
  | "marketer"     // ad surfaces + analytics, no POS
  | "affiliate"    // external partner with attribution link
  | "viewer"       // read-only everything
  | "custom"

export type Role = {
  key: RoleKey
  name: string
  /** One-line tagline for the picker. */
  tagline: string
  /** Long-form description for the role detail page. */
  description: string
  /** Coarse permission summary the UI surfaces in cards. */
  permissions: {
    inventory: "none" | "read" | "write"
    pos: "none" | "use" | "void"
    purchasing: "none" | "read" | "write"
    reporting: "none" | "read" | "export"
    marketing: "none" | "read" | "manage"
    team: "none" | "read" | "manage"
    settings: "none" | "read" | "manage" | "billing"
  }
  /** Tone class for the badge in lists. */
  tone:
    | "brand"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
  /** Some roles are external (affiliate); they invite-flow differently. */
  external?: boolean
}

export type Location = {
  id: string
  name: string
  /** City label for short displays — "Austin", "East DC". */
  city: string
}

export type MemberStatus = "active" | "invited" | "suspended"

export type Member = {
  id: string
  name: string
  email: string
  role: RoleKey
  status: MemberStatus
  /** Optional avatar override; otherwise initials + tinted bg. */
  avatarUrl?: string
  /** Location IDs this member can act in. Empty = HQ / all. */
  locationIds: string[]
  /** Last activity ISO timestamp. Undefined for invited members. */
  lastActiveAt?: string
  /** Joined date ISO. */
  joinedAt: string
  /** Sales this month — relevant for sales-rep + affiliate roles. */
  mtdSalesUsd?: number
  /** Commission accrued this month at the member's rate. */
  mtdCommissionUsd?: number
  /** Affiliate-specific. */
  affiliateCode?: string
  affiliateClicks?: number
}

export type Invite = {
  id: string
  email: string
  role: RoleKey
  locationIds: string[]
  invitedAt: string
  expiresAt: string
  invitedBy: string
  /** Pre-filled welcome note. */
  note?: string
  /** Token used in the share URL. Stable + opaque. */
  token: string
}

export type Session = {
  id: string
  memberId: string
  /** Where the session was created. */
  device: string
  /** Approximate location from IP. */
  approxLocation?: string
  /** ISO timestamp. */
  startedAt: string
  /** ISO timestamp. */
  lastSeenAt: string
  /** True for the requester's own session — UI uses this to label it
   *  "This device" + suppress the "Revoke" button. */
  current: boolean
}
