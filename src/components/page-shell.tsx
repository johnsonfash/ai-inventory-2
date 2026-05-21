import * as React from "react"
import { useSetPageMeta } from "@/contexts/page-meta"

type PageShellProps = {
  title: string
  children: React.ReactNode
  /** Show the contextual quick-action toolbar (desktop only). */
  withToolbar?: boolean
  /** Right-aligned slot in the mobile top bar (e.g., a filter button). */
  mobileTrailing?: React.ReactNode
  /** Override the page-level CTAs in the desktop toolbar. */
  toolbarActions?: React.ReactNode
  /** Optional plain-English explanation of the page title. Renders
   *  as an info button next to the title. Use on pages with
   *  jargon-y names (RMA, Goods receipt, Balance sheet). */
  titleTooltip?: React.ReactNode
}

// Thin "publish my page meta + render content" wrapper. The actual
// chrome (sidebar, mobile top bar, bottom nav, header, toolbar,
// pull-to-refresh) lives in src/components/app-frame.tsx, mounted
// once at the top of the tree so it stays stable across route
// changes. A page-level Suspense fallback only swaps the children
// here, not the chrome above it.
//
// API kept identical to the pre-Wave-25 shell so all 131 pages keep
// working without per-page edits.
export function PageShell({
  title,
  children,
  withToolbar = true,
  mobileTrailing,
  toolbarActions,
  titleTooltip,
}: PageShellProps) {
  useSetPageMeta({ title, withToolbar, mobileTrailing, toolbarActions, titleTooltip })
  return <>{children}</>
}
