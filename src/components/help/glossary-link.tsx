import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

// App Wave 7: link a jargon term inside a tooltip / empty state to its
// glossary definition. The glossary page renders anchors as
// `#term-<id>` and scrolls to them on load, so dropping a
// <GlossaryLink termId="rma">RMA</GlossaryLink> anywhere gives the reader
// a one-tap explainer without leaving a learning gap.

export function glossaryHref(termId: string): string {
  return `/help/glossary#term-${termId}`
}

export function GlossaryLink({
  termId,
  children,
  className,
}: {
  termId: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      to={glossaryHref(termId)}
      className={cn(
        "font-medium underline decoration-dotted underline-offset-2 hover:text-brand dark:hover:text-primary",
        className,
      )}
    >
      {children}
    </Link>
  )
}
