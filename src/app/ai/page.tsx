"use client"

import * as React from "react"
import { PageShell } from "@/src/components/page-shell"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"

type Msg = { role: "user" | "assistant"; content: string }

const suggestions = [
  "Show low stock items under 10 units",
  "Summarize purchase orders received this week",
  "Which products are trending this month?",
  "Who are the top customers by revenue?",
]

export default function AIChat() {
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi! I can help with inventory, sales, purchases, and reports. Try a suggestion below.",
    },
  ])
  const [text, setText] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState<string[]>([])
  const [ctx, setCtx] = React.useState({
    org: "Acme Inc",
    loc: "WH-A • Austin",
    includeLowStock: true,
    includeOpenPOs: true,
    includeRecentSales: false,
  })

  async function send() {
    if (!text.trim()) return
    const prompt = buildPrompt(text, ctx)
    const user = { role: "user" as const, content: text.trim() }
    setText("")
    setMsgs((m) => [...m, user, { role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        body: JSON.stringify({ prompt, context: ctx }),
      })
      const data = await res.json()
      // typewriter simulate
      const reply = String(data.reply ?? "")
      await typeWriter(reply)
    } catch {
      await typeWriter("Sorry, AI is not configured yet. This is a mock reply. You can wire AI SDK later.")
    }
  }

  function buildPrompt(q: string, c: typeof ctx) {
    const ctxParts = [
      `Org: ${c.org}`,
      `Location: ${c.loc}`,
      c.includeLowStock ? "Include low stock snapshot." : "",
      c.includeOpenPOs ? "Include open purchase orders status." : "",
      c.includeRecentSales ? "Include recent sales delta." : "",
    ]
      .filter(Boolean)
      .join(" ")
    return `${q}\n\nContext:\n${ctxParts}`
  }

  async function typeWriter(text: string) {
    const idx = msgs.length
    for (let i = 1; i <= text.length; i++) {
      const chunk = text.slice(0, i)
      await new Promise((r) => setTimeout(r, 6))
      setMsgs((m) => {
        const copy = m.slice()
        copy[idx] = { role: "assistant", content: chunk }
        return copy
      })
    }
  }

  function saveQuery() {
    if (!msgs.length) return
    setSaving(true)
    const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content
    if (lastUser && !saved.includes(lastUser)) setSaved((s) => [lastUser, ...s])
    setTimeout(() => setSaving(false), 400)
  }

  return (
    <PageShell title="AI Assistant" withToolbar={false}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
            <CardDescription>Try one-click prompts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium mb-2">Context</div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Organization</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={ctx.org}
                    onChange={(e) => setCtx((c) => ({ ...c, org: e.target.value }))}
                  >
                    <option>Acme Inc</option>
                    <option>BrightLane</option>
                    <option>NovaApps</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={ctx.loc}
                    onChange={(e) => setCtx((c) => ({ ...c, loc: e.target.value }))}
                  >
                    <option>WH-A • Austin</option>
                    <option>WH-B • Atlanta</option>
                    <option>WH-C • Denver</option>
                  </select>
                </div>
                <label className="flex items-center justify-between">
                  <span>Include low stock snapshot</span>
                  <input
                    type="checkbox"
                    checked={ctx.includeLowStock}
                    onChange={(e) => setCtx((c) => ({ ...c, includeLowStock: e.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Include open purchase orders</span>
                  <input
                    type="checkbox"
                    checked={ctx.includeOpenPOs}
                    onChange={(e) => setCtx((c) => ({ ...c, includeOpenPOs: e.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Include recent sales delta</span>
                  <input
                    type="checkbox"
                    checked={ctx.includeRecentSales}
                    onChange={(e) => setCtx((c) => ({ ...c, includeRecentSales: e.target.checked }))}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium mb-2">Saved</div>
              <ul className="space-y-2 text-sm">
                {saved.length === 0 ? <li className="text-muted-foreground">No saved prompts.</li> : null}
                {saved.map((q) => (
                  <li key={q}>
                    <button onClick={() => setText(q)} className="hover:underline">
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium mb-2">Quick Links</div>
              <div className="flex flex-col gap-2">
                <Link href="/inventory" className="text-violet-600 hover:underline">
                  Inventory — Items
                </Link>
                <Link href="/reporting/stock" className="text-violet-600 hover:underline">
                  Reporting — Stock
                </Link>
                <Link href="/purchasing/pos" className="text-violet-600 hover:underline">
                  Purchasing — Purchase Orders
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ask anything</CardTitle>
                <CardDescription>Context-aware answers</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-transparent" onClick={saveQuery} disabled={saving}>
                  {saving ? "Saving..." : "Save prompt"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-auto rounded-md border p-3">
              {msgs.map((m, i) => (
                <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] rounded-md px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-violet-600 text-white" : "bg-muted"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='e.g. "Which SKUs are below reorder point?"'
              />
              <Button onClick={send}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
