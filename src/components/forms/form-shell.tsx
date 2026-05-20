import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  /** Subtitle below the page title. */
  description?: string
  /** Where the "Back" affordance points. Defaults to going back in history. */
  backHref?: string
  /** Submit handler — wired to the <form> element. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  /** Sticky footer slot — usually a <FormFooter> with Cancel + primary CTA. */
  footer?: React.ReactNode
  /** Right-column aside on desktop. Hidden below md. */
  aside?: React.ReactNode
  children: React.ReactNode
}

// Page-level layout for forms. Desktop: 2-column with form left, aside right.
// Mobile: single column with sticky footer above the bottom nav.
export function FormShell({
  title,
  description,
  backHref,
  onSubmit,
  footer,
  aside,
  children,
}: Props) {
  const navigate = useNavigate()

  return (
    <PageShell title={title} withToolbar={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.(e)
        }}
        className="flex flex-col gap-5"
      >
        {/* Header */}
        <header className="flex flex-col gap-2">
          {backHref ? (
            <Link
              to={backHref}
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold tracking-tight md:text-xl">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </header>

        {/* Main grid */}
        <div className={cn("grid gap-5", aside ? "lg:grid-cols-[1fr_320px]" : "")}>
          <div className="space-y-5">{children}</div>
          {aside && <aside className="hidden space-y-3 lg:block">{aside}</aside>}
        </div>

        {/* Footer — sticky on mobile, inline on desktop */}
        {footer && (
          <div
            className={cn(
              "sticky bottom-0 z-20 -mx-4 mt-2 border-t border-border bg-background/90 px-4 py-3 pwa-bottom backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:pt-3 md:pwa-bottom-0",
            )}
          >
            {footer}
          </div>
        )}
      </form>
    </PageShell>
  )
}
