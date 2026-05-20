import { Link } from "react-router-dom"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <PageShell title="Not found" withToolbar={false}>
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="text-6xl font-bold tracking-tight">404</div>
        <p className="max-w-md text-muted-foreground">
          We couldn't find the page you were looking for. It may have been moved, renamed, or never existed.
        </p>
        <Link to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </PageShell>
  )
}
