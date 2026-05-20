import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Standalone /login page — used when someone hits the URL directly
// (vs the modal triggered from any "Sign in" button). Same submit
// path as the modal (dummy navigate to /dashboard).
export default function LoginPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    document.title = "Sign in — Pallio"
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    await new Promise((r) => setTimeout(r, 600))
    navigate("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/20"
      >
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-soft via-card to-emerald-50/40 px-6 py-6 dark:from-primary/10 dark:to-emerald-950/15">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/30 blur-3xl dark:bg-primary/30" aria-hidden />
          <div className="relative flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-sm font-bold text-white shadow-sm shadow-brand/30">
                P
              </span>
              <span className="text-sm font-bold tracking-tight">Pallio</span>
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your business from one place.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 px-6 py-6">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/80">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
            <Input type="email" autoComplete="email" placeholder="you@business.com" required />
          </label>
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/80">
              <Lock className="h-3.5 w-3.5" /> Password
            </span>
            <Input type="password" autoComplete="current-password" placeholder="••••••••" required />
          </label>

          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-1.5 text-muted-foreground">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-violet-600" />
              Stay signed in
            </label>
            <Link to="/contact" className="font-medium text-brand hover:underline dark:text-primary">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={busy} size="lg" className="mt-2">
            {busy ? "Just a sec…" : "Sign in"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            New to Pallio?{" "}
            <Link to="/dashboard" className="font-semibold text-brand hover:underline dark:text-primary">
              Create an account
            </Link>
          </p>
        </form>

        <div className="flex items-center justify-center gap-2 border-t border-border bg-muted/30 px-6 py-3 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          Bank-grade encryption · Face ID unlock on iOS
        </div>
      </motion.div>
    </div>
  )
}
