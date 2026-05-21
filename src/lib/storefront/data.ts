import { kv } from "@/lib/storage/kv"
import type { StorefrontState, StorefrontTemplate } from "./types"

// Storefront template catalogue. Each entry is a hand-tuned shop
// design across a sector × style matrix. Real images via Unsplash
// CDN so the gallery doesn't look like a Lorem-Ipsum demo.
//
// Every template ships with the same "essential" pages (Home,
// Product, Cart, Checkout, Order tracking, About, Contact, Privacy,
// Terms). Templates also add a couple of sector-specific extras
// (lookbook for fashion, blog for food, etc.).

const ESSENTIAL_PAGES = [
  { path: "/",          name: "Home",         description: "Hero, featured products, newsletter signup.", essential: true },
  { path: "/shop",      name: "Shop",         description: "Filterable catalog grid with category drilldown.", essential: true },
  { path: "/p/:slug",   name: "Product",      description: "Photos, variants, size guide, add-to-cart, reviews.", essential: true },
  { path: "/cart",      name: "Cart",         description: "Editable line items, promo code, shipping estimate.", essential: true },
  { path: "/checkout",  name: "Checkout",     description: "Address, delivery method, payment — single-page.", essential: true },
  { path: "/order/:id", name: "Order tracking", description: "Live status + courier link sent to the buyer.", essential: true },
  { path: "/account",   name: "Customer account", description: "Order history, addresses, saved cards.", essential: true },
  { path: "/about",     name: "About",        description: "Story + founder photo + business values.", essential: true },
  { path: "/contact",   name: "Contact",      description: "Form + WhatsApp link + business address map.", essential: true },
  { path: "/privacy",   name: "Privacy",      description: "NDPR-compliant data + cookie policy.", essential: true },
  { path: "/terms",     name: "Terms",        description: "Sale terms, return policy, shipping promise.", essential: true },
]

export const TEMPLATES: StorefrontTemplate[] = [
  {
    id: "lekki-luxe",
    name: "Lekki Luxe",
    tagline: "Editorial-style fashion boutique with full-bleed hero and look-book.",
    sector: "fashion",
    style: "luxe",
    cover: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#1f1f1f", accent: "#d4af37" },
    tier: "premium",
    popularity: 94,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/lookbook",  name: "Lookbook",   description: "Editorial photoshoot pages with shoppable hotspots." },
      { path: "/journal",   name: "Journal",    description: "Long-form blog for styling tips + collection drops." },
    ],
    highlights: [
      "Full-bleed cinematic hero with parallax product reveal",
      "Lookbook page with hotspot tags that open the product modal",
      "Sticky add-to-cart bar on mobile product pages",
      "Cinematic loading transitions between collection pages",
    ],
  },
  {
    id: "ankara-bold",
    name: "Ankara Bold",
    tagline: "High-contrast fashion shop celebrating West African prints.",
    sector: "fashion",
    style: "bold",
    cover: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#b91c1c", accent: "#fbbf24" },
    tier: "pro",
    popularity: 88,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/collections", name: "Collections", description: "Story-driven seasonal collection pages." },
      { path: "/custom",      name: "Custom orders", description: "Made-to-measure intake form with appointment booking." },
    ],
    highlights: [
      "Print-pattern background motifs that tile responsively",
      "Made-to-measure form posts straight into Pallio Appointments",
      "Color + size variant swatches show live stock counts",
      "Free WhatsApp delivery on orders over ₦20k auto-flagged at checkout",
    ],
  },
  {
    id: "glow-minimal",
    name: "Glow Minimal",
    tagline: "Spa-quiet beauty store with whitespace and clean typography.",
    sector: "beauty",
    style: "minimal",
    cover: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#fef3f2", accent: "#be185d" },
    tier: "free",
    popularity: 76,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/routine",      name: "Routine builder", description: "Quiz that recommends a 5-step product routine." },
      { path: "/ingredients",  name: "Ingredient glossary", description: "Plain-language explanations of every active in the catalog." },
    ],
    highlights: [
      "Skin-quiz wizard that produces a personalised cart in one tap",
      "Live ingredients glossary with conflict warnings",
      "Subscription option with 'every 60 days' delivery cadence",
      "Real customer review carousel on each product",
    ],
  },
  {
    id: "naija-deli",
    name: "Naija Deli",
    tagline: "Restaurant + food-shop hybrid with table reservation.",
    sector: "food",
    style: "playful",
    cover: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#dc2626", accent: "#16a34a" },
    tier: "pro",
    popularity: 92,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/menu",         name: "Menu",        description: "Category-tabbed menu with allergens + nutrition." },
      { path: "/reserve",      name: "Reservations", description: "Table booking that lands in Pallio Appointments." },
      { path: "/locations",    name: "Locations",   description: "Hours + map for each branch." },
    ],
    highlights: [
      "Time-slot menu (breakfast / lunch / dinner) auto-switches by clock",
      "Delivery radius checker — refuses orders outside courier range",
      "Reservation form blocks already-booked slots in real time",
      "Photo-led mobile menu — taps open big product images",
    ],
  },
  {
    id: "vendor-grid",
    name: "Vendor Grid",
    tagline: "Dense product matrix with sidebar filters + stock chips for high-SKU electronics shops.",
    sector: "electronics",
    style: "bold",
    variant: 3,
    cover: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#1e3a8a", accent: "#0ea5e9" },
    tier: "free",
    popularity: 81,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/compare",   name: "Compare",     description: "Side-by-side spec comparison for up to 4 products." },
      { path: "/warranty",  name: "Warranty",    description: "Self-serve warranty claim form + RMA generator." },
    ],
    highlights: [
      "Spec-sheet panel on every product (CPU, RAM, ports, etc.)",
      "Compare-up-to-4 feature with a sticky compare bar",
      "Warranty claim form auto-creates an RMA in Pallio Returns",
      "Stock counter shows 'last unit in Lagos' urgency cues",
    ],
  },
  {
    id: "homestead",
    name: "Homestead",
    tagline: "Warm, story-driven shop for home + lifestyle goods.",
    sector: "home",
    style: "editorial",
    cover: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#92400e", accent: "#a3a3a3" },
    tier: "pro",
    popularity: 79,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/stories",   name: "Stories",  description: "Maker profiles + behind-the-scenes content." },
      { path: "/registry",  name: "Gift registry", description: "Wedding / housewarming registry with sharable link." },
    ],
    highlights: [
      "Magazine-style story pages embed shoppable product cards",
      "Gift registry generates a unique share-link per couple",
      "Catalog filters by room (kitchen / bedroom / living)",
      "Bundles auto-suggest 'complete the set' at the cart",
    ],
  },
  {
    id: "garage-pro",
    name: "Garage Pro",
    tagline: "Auto-parts catalog with VIN lookup + bay scheduling.",
    sector: "auto",
    style: "bold",
    variant: 2,
    cover: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#0f172a", accent: "#facc15" },
    tier: "premium",
    popularity: 71,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/fitment",   name: "Fitment lookup", description: "Find parts that match a year / make / model." },
      { path: "/service",   name: "Book service",   description: "Bay scheduling that ties into Pallio Appointments." },
      { path: "/manuals",   name: "Manuals",        description: "Downloadable PDF service manuals + how-tos." },
    ],
    highlights: [
      "VIN decoder narrows the catalog to compatible parts only",
      "Service-bay scheduling honors mechanic availability",
      "Customer notifications when their car is ready for pickup",
      "B2B trade pricing tier auto-applies for verified workshops",
    ],
  },
  {
    id: "trade-hub",
    name: "Trade Hub",
    tagline: "Wholesale B2B portal with MOQ pricing matrix + NET-30 credit dashboard.",
    sector: "wholesale",
    style: "minimal",
    variant: 4,
    cover: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#374151", accent: "#22c55e" },
    tier: "premium",
    popularity: 68,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/portal",    name: "Buyer portal",  description: "Logged-in catalog with negotiated prices + reorder flows." },
      { path: "/quote",     name: "Quote request", description: "RFQ form for custom volumes + delivery windows." },
      { path: "/credit",    name: "Credit terms",  description: "Apply for Net 30 / Net 60 terms with KYC upload." },
    ],
    highlights: [
      "Buyer accounts see their negotiated tier (Wholesale / Distributor)",
      "Bulk-order template downloads accept CSV/Excel re-imports",
      "Net 30 / 60 terms unlocked per-account after KYC approval",
      "Hidden from the public web — login-only catalog",
    ],
  },
  {
    id: "atelier",
    name: "Atelier",
    tagline: "Booking-led editorial for salons, spas, and studios with date + time slot picker on the hero.",
    sector: "services",
    style: "editorial",
    variant: 2,
    cover: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#7c2d12", accent: "#fb923c" },
    tier: "pro",
    popularity: 84,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/services",  name: "Services",     description: "Treatments + durations + per-stylist pricing." },
      { path: "/book",      name: "Book online",  description: "Pick a stylist + slot; deposit charged on confirmation." },
      { path: "/gift",      name: "Gift cards",   description: "Sell digital gift cards with a personalised note." },
    ],
    highlights: [
      "Stylist-level availability — clients pick their preferred specialist",
      "Deposit-on-booking reduces no-shows dramatically",
      "Digital gift cards email a personalised PDF instantly",
      "Loyalty stamp card unlocks after 5 visits automatically",
    ],
  },
  {
    id: "studio-flow",
    name: "Studio Flow",
    tagline: "Single-product launch landing page with countdown + waitlist.",
    sector: "fashion",
    style: "minimal",
    variant: 3,
    cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#0f172a", accent: "#ec4899" },
    tier: "free",
    popularity: 65,
    pages: [
      { path: "/",          name: "Landing",         description: "Big hero, countdown, email capture, social proof.", essential: true },
      { path: "/checkout",  name: "Checkout",        description: "Single-product purchase; no cart needed.", essential: true },
      { path: "/order/:id", name: "Order tracking",  description: "Status updates + courier link.", essential: true },
      { path: "/privacy",   name: "Privacy",         description: "NDPR compliant.", essential: true },
      { path: "/terms",     name: "Terms",           description: "Refunds + delivery promises.", essential: true },
    ],
    highlights: [
      "Drop-style launch page with live countdown to release",
      "Waitlist captures email before product goes live",
      "Single-product checkout — no cart, no friction",
      "Limited-quantity counter creates real urgency",
    ],
  },
  {
    id: "sole-society",
    name: "Sole Society",
    tagline: "High-energy sneaker drop shop with raffle + size-bot defense.",
    sector: "fashion",
    style: "bold",
    variant: 1,
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#0a0a0a", accent: "#f97316" },
    tier: "premium",
    popularity: 91,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/raffles",   name: "Raffles",     description: "Random-draw signups for limited-pair drops." },
      { path: "/release",   name: "Release calendar", description: "Upcoming drops with countdown timers." },
    ],
    highlights: [
      "Drop-style hero with countdown + raffle entry",
      "Size-grid selector with stock heat map per size",
      "Bot-defense: queue + CAPTCHA + per-IP limit at checkout",
      "Resale-floor price chip pulled from StockX / GOAT",
    ],
  },
  {
    id: "suya-spot",
    name: "Suya Spot",
    tagline: "Street-food chain with branch picker, live wait times + 30-min delivery.",
    sector: "food",
    style: "bold",
    variant: 4,
    cover: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#b91c1c", accent: "#fbbf24" },
    tier: "pro",
    popularity: 86,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/locations", name: "Locations",   description: "Branch map with live wait times." },
      { path: "/catering",  name: "Catering",    description: "Bulk orders for events + corporate." },
    ],
    highlights: [
      "Live branch picker with wait times + ETA",
      "Combo builder with portion + heat-level pickers",
      "Scheduled pickup window or on-demand delivery",
      "WhatsApp order updates from kitchen to door",
    ],
  },
  {
    id: "brew-co",
    name: "Brew & Co",
    tagline: "Specialty coffee subscription + single-origin bean shop.",
    sector: "food",
    style: "minimal",
    variant: 1,
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#78350f", accent: "#fbbf24" },
    tier: "pro",
    popularity: 78,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/subscribe", name: "Subscription", description: "Monthly bean drop — pick grind + cadence." },
      { path: "/brew",      name: "Brew guides",  description: "Pour-over + Aeropress + Chemex recipes." },
    ],
    highlights: [
      "Subscription builder — pick origin, grind, cadence",
      "Tasting-note tags on every bag (acidity, body, sweetness)",
      "Auto-pause + skip-month with a single tap",
      "Brew-guide library wired to each bean's profile",
    ],
  },
  {
    id: "pharm-co",
    name: "Pharm + Co",
    tagline: "Trusted pharmacy storefront with prescription upload + chat with pharmacist.",
    sector: "beauty",
    style: "minimal",
    cover: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#047857", accent: "#0ea5e9" },
    tier: "premium",
    popularity: 83,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/rx",        name: "Upload Rx",     description: "Securely upload prescription for fulfillment." },
      { path: "/consult",   name: "Pharmacist chat", description: "1-on-1 chat with a registered pharmacist." },
      { path: "/refill",    name: "Auto-refill",   description: "Schedule recurring deliveries for repeat meds." },
    ],
    highlights: [
      "NDPR + HIPAA-aligned secure prescription upload",
      "Live chat with a registered pharmacist 8am–8pm",
      "Auto-refill schedule with cold-chain delivery",
      "Drug interaction checker on the cart page",
    ],
  },
  {
    id: "the-folio",
    name: "The Folio",
    tagline: "Curated bookstore with editor picks + book-club subscription.",
    sector: "services",
    style: "editorial",
    variant: 1,
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#7f1d1d", accent: "#f59e0b" },
    tier: "pro",
    popularity: 72,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/book-club", name: "Book club",    description: "Monthly book + virtual discussion ticket." },
      { path: "/staff-picks", name: "Staff picks", description: "Editorial reviews from the in-store curators." },
    ],
    highlights: [
      "Editorial review system — every book gets a write-up",
      "Book-club subscription with bundled virtual events",
      "Reading-list builder customers can publish + share",
      "Author appearance calendar with RSVP",
    ],
  },
  {
    id: "pawsome",
    name: "Pawsome",
    tagline: "Pet-supply shop with breed-aware food finder + vet teleconsult.",
    sector: "services",
    style: "playful",
    variant: 1,
    cover: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#0891b2", accent: "#facc15" },
    tier: "free",
    popularity: 74,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/find-food", name: "Food finder",   description: "Quiz that recommends food by breed + age + weight." },
      { path: "/vet",       name: "Vet teleconsult", description: "Book a video call with a licensed vet." },
    ],
    highlights: [
      "Breed-aware food finder quiz",
      "Auto-renewing food subscription with size scaling",
      "Vet teleconsult booking inline in the cart",
      "Loyalty points redeemable for grooming sessions",
    ],
  },
  {
    id: "crafted",
    name: "Crafted",
    tagline: "Handmade homeware marketplace with maker stories per item.",
    sector: "home",
    style: "playful",
    variant: 2,
    cover: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#9333ea", accent: "#f97316" },
    tier: "pro",
    popularity: 76,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/makers",    name: "Makers",       description: "Profile page per artisan with their full catalog." },
      { path: "/custom",    name: "Custom order", description: "Request a one-of-a-kind piece directly from the maker." },
    ],
    highlights: [
      "Per-maker profile + provenance for every piece",
      "Custom-order flow from buyer → maker → quote → ship",
      "Multi-vendor cart that splits payouts automatically",
      "'Where it was made' map pin on every product page",
    ],
  },
  {
    id: "spa-verve",
    name: "Spa Verve",
    tagline: "High-end spa + wellness retreat with online booking + gift cards.",
    sector: "services",
    style: "luxe",
    variant: 1,
    cover: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#27272a", accent: "#d97706" },
    tier: "premium",
    popularity: 81,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/treatments", name: "Treatments",   description: "Full menu of treatments + therapists." },
      { path: "/gift",       name: "Gift cards",   description: "Digital + physical, customisable amounts." },
      { path: "/membership", name: "Membership",   description: "Monthly tier with unlimited treatments." },
    ],
    highlights: [
      "Live therapist availability + 1-tap rebooking",
      "Membership tier with stored credit + perks",
      "Branded digital gift cards that send via WhatsApp",
      "Pre-treatment intake form auto-emailed before arrival",
    ],
  },
  {
    id: "tech-stack",
    name: "Tech Stack",
    tagline: "Premium electronics shop with B2B quotes + price-match guarantee.",
    sector: "electronics",
    style: "minimal",
    variant: 2,
    cover: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&h=800&fit=crop&auto=format&q=80",
    colors: { primary: "#1e293b", accent: "#0ea5e9" },
    tier: "pro",
    popularity: 79,
    pages: [
      ...ESSENTIAL_PAGES,
      { path: "/quote",     name: "Request quote", description: "B2B bulk pricing — submit a list, get a quote in 2 hours." },
      { path: "/compare",   name: "Compare",       description: "Side-by-side specs for up to 4 products." },
      { path: "/warranty",  name: "Warranty",      description: "Register, claim, and track warranty status." },
    ],
    highlights: [
      "Spec-comparison tool for up to 4 products at once",
      "Price-match guarantee with automated competitor check",
      "B2B quote builder with NET-30 terms option",
      "Serial-number-based warranty registration + claims",
    ],
  },
]

export const TEMPLATES_BY_ID: Record<string, StorefrontTemplate> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
)

// ---------- kv-backed state ----------
const STATE_KEY = "pallio:storefront-state"

const DEFAULT_STATE: StorefrontState = {
  templateId: null,
  subdomain: "funke-apparel",
  customDomain: null,
  published: false,
  brand: {
    businessName: "Funke Apparel",
    primaryColor: "#7c3aed",
    accentColor: "#ec4899",
    logoUrl: null,
  },
  paymentProviderIds: ["paystack"],
  deliveryProviderIds: ["gig-logistics"],
  publishedProducts: 0,
  activatedAt: null,
}

export function getStorefrontState(): StorefrontState {
  const raw = kv.get(STATE_KEY)
  if (!raw) return DEFAULT_STATE
  try {
    const parsed = JSON.parse(raw) as Partial<StorefrontState>
    return { ...DEFAULT_STATE, ...parsed, brand: { ...DEFAULT_STATE.brand, ...(parsed.brand ?? {}) } }
  } catch {
    return DEFAULT_STATE
  }
}

export async function setStorefrontState(state: StorefrontState): Promise<void> {
  await kv.set(STATE_KEY, JSON.stringify(state))
}

export async function activateTemplate(templateId: string): Promise<void> {
  const state = getStorefrontState()
  const template = TEMPLATES_BY_ID[templateId]
  if (!template) return
  await setStorefrontState({
    ...state,
    templateId,
    activatedAt: new Date().toISOString(),
    // Adopt the template's brand palette as the starting point;
    // owner can override in /storefront after.
    brand: {
      ...state.brand,
      primaryColor: template.colors.primary,
      accentColor: template.colors.accent,
    },
  })
}
