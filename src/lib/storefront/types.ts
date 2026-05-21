// Storefront templates + the user's chosen-template state. Once a
// template is picked, Pallio spins up a hosted shop at
// {subdomain}.pallio.shop (the customer-facing storefront) and the
// owner gets the management surface at /storefront.

export type StorefrontSector =
  | "fashion"
  | "beauty"
  | "food"
  | "electronics"
  | "home"
  | "auto"
  | "wholesale"
  | "services"

export type StorefrontStyle = "minimal" | "bold" | "editorial" | "playful" | "luxe"

export type StorefrontPage = {
  /** Slug shown in the storefront — e.g. "/", "/about". */
  path: string
  /** Human label. */
  name: string
  /** One-line summary so the owner knows what's in it without
   *  clicking through. */
  description: string
  /** Whether the page is essential (always included) or optional
   *  (template ships with it but the owner can disable). */
  essential?: boolean
}

export type StorefrontTemplate = {
  id: string
  name: string
  tagline: string
  /** Sector this template is tuned for. Drives the example imagery
   *  + the suggested product fields. */
  sector: StorefrontSector
  /** Visual style — minimal / bold / editorial / playful / luxe.
   *  Used by the gallery's filter chips. */
  style: StorefrontStyle
  /** Cover photo for the gallery card + preview hero. Real Unsplash
   *  CDN URLs so the gallery looks like a real product. */
  cover: string
  /** Two-tone primary + accent for the brand-tint chip in the
   *  gallery. */
  colors: { primary: string; accent: string }
  /** Pages that ship with the template. */
  pages: StorefrontPage[]
  /** Notable highlights — bullet list shown on the detail page. */
  highlights: string[]
  /** Recommended price tier for the template (badge in the gallery). */
  tier: "free" | "pro" | "premium"
  /** Mock revenue +/- metric used for the "merchants love this" rail
   *  on the gallery — keeps the page feeling alive. */
  popularity: number
  /** Optional layout variant within the chosen style. `0` (or
   *  unset) renders the default; higher numbers switch to
   *  alternative hero compositions so templates sharing a style
   *  don't look identical. */
  variant?: number
}

export type StorefrontState = {
  /** Picked template id. `null` = no storefront yet (gallery is the
   *  default view). */
  templateId: string | null
  /** Pallio-hosted subdomain — e.g. "funke-apparel" produces
   *  `funke-apparel.pallio.shop`. */
  subdomain: string
  /** Optional custom domain the owner has pointed at Pallio via
   *  CNAME or A record. */
  customDomain: string | null
  /** Whether the storefront is live + accessible to shoppers. */
  published: boolean
  /** Brand applied on top of the template — overrides the template
   *  defaults. */
  brand: {
    businessName: string
    primaryColor: string
    accentColor: string
    logoUrl: string | null
  }
  /** Which payment integrations route checkout. Keyed by integration
   *  id. */
  paymentProviderIds: string[]
  /** Which delivery integrations are offered at checkout. */
  deliveryProviderIds: string[]
  /** Number of products published to the storefront. */
  publishedProducts: number
  /** When the template was first activated. */
  activatedAt: string | null
}
