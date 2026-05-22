import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Bot,
  ClipboardCheck,
  Copy,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  TrendingUp,
  User as UserIcon,
} from "lucide-react"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { aiChat } from "@/lib/api-mocks/ai-chat"
import { useRegisterPageRefresh } from "@/hooks/use-pull-to-refresh"
import { useChatKeyboard } from "@/hooks/use-chat-keyboard"
import { BottomSheet } from "@/components/mobile/bottom-sheet"
import { SwitchField } from "@/components/forms/switch-field"
import { useAutoMarkStep } from "@/hooks/use-auto-mark-step"
import { cn } from "@/lib/utils"

type Msg = {
  id: string
  role: "user" | "assistant"
  content: string
  pending?: boolean
}

const SUGGESTIONS = [
  { label: "Low stock under 10", prompt: "Show low stock items under 10 units", Icon: TrendingUp },
  { label: "Top trending products", prompt: "Which products are trending this month?", Icon: Sparkles },
  { label: "Open POs summary", prompt: "Summarize purchase orders received this week", Icon: ClipboardCheck },
  { label: "Top customers", prompt: "Who are the top customers by revenue?", Icon: UserIcon },
  { label: "Tax owed this quarter", prompt: "How much tax do I owe this quarter?", Icon: Bookmark },
  { label: "Margin drift", prompt: "Which categories have the biggest margin change?", Icon: TrendingUp },
]

let msgIdSeq = 0
const newId = () => `m-${++msgIdSeq}`

export default function AIChat() {
  useAutoMarkStep("talk-to-ai")
  // Chat-aware keyboard handling on native. `scrollRef` is the same
  // ref the auto-scroll effect uses; the hook owns it so the
  // ResizeObserver auto-snap can read .scrollHeight + reattach when
  // the messages container resizes due to keyboard padding.
  const kb = useChatKeyboard()
  const scrollRef = kb.scrollContainerRef

  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      id: newId(),
      role: "assistant",
      content:
        "Hi — I'm Pallio AI. Ask me about inventory, sales, purchases, or finance. I have access to your live data within the scope you set on the right.",
    },
  ])
  const [text, setText] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [saved, setSaved] = React.useState<string[]>([])
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [ctx, setCtx] = React.useState({
    org: "Funke Apparel",
    loc: "Lekki Phase 1",
    includeLowStock: true,
    includeOpenPOs: true,
    includeRecentSales: false,
  })

  useRegisterPageRefresh(React.useCallback(async () => { await new Promise((r) => setTimeout(r, 400)) }, []))

  // Auto-scroll on new content
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs.length, msgs[msgs.length - 1]?.content])

  function buildPrompt(q: string) {
    const parts = [
      `Org: ${ctx.org}`,
      `Location: ${ctx.loc}`,
      ctx.includeLowStock ? "Include low stock snapshot." : "",
      ctx.includeOpenPOs ? "Include open purchase orders status." : "",
      ctx.includeRecentSales ? "Include recent sales delta." : "",
    ]
      .filter(Boolean)
      .join(" ")
    return `${q}\n\nContext:\n${parts}`
  }

  async function send(prompt?: string) {
    const value = (prompt ?? text).trim()
    if (!value || busy) return
    const userMsg: Msg = { id: newId(), role: "user", content: value }
    const placeholder: Msg = { id: newId(), role: "assistant", content: "", pending: true }
    setMsgs((m) => [...m, userMsg, placeholder])
    setText("")
    setBusy(true)
    try {
      const data = await aiChat({ prompt: buildPrompt(value), context: ctx })
      await typeWriter(placeholder.id, String(data.reply ?? ""))
    } catch {
      await typeWriter(placeholder.id, "Sorry — the AI provider isn't configured yet. This response is mocked.")
    } finally {
      setBusy(false)
    }
  }

  async function typeWriter(id: string, full: string) {
    for (let i = 1; i <= full.length; i++) {
      const chunk = full.slice(0, i)
      await new Promise((r) => setTimeout(r, 5))
      setMsgs((m) => m.map((msg) => (msg.id === id ? { ...msg, content: chunk, pending: i < full.length } : msg)))
    }
  }

  function saveLastQuery() {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content
    if (lastUser && !saved.includes(lastUser)) setSaved((s) => [lastUser, ...s])
  }

  function resetThread() {
    setMsgs([
      {
        id: newId(),
        role: "assistant",
        content: "New thread started. What's on your mind?",
      },
    ])
  }

  const renderSettings = (
    <div className="space-y-3">
      <FieldRow label="Organization">
        <Select value={ctx.org} onValueChange={(v) => v && setCtx((c) => ({ ...c, org: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Funke Apparel">Funke Apparel</SelectItem>
            <SelectItem value="Eko Provisions">Eko Provisions</SelectItem>
            <SelectItem value="LagosMart">LagosMart</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>
      <FieldRow label="Location">
        <Select value={ctx.loc} onValueChange={(v) => v && setCtx((c) => ({ ...c, loc: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Lekki Phase 1">Lekki Phase 1</SelectItem>
            <SelectItem value="Ikeja City Mall">Ikeja City Mall</SelectItem>
            <SelectItem value="Wuse 2 — Abuja">Wuse 2 — Abuja</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>
      <SwitchField
        label="Low stock snapshot"
        description="Include items at or below reorder."
        checked={ctx.includeLowStock}
        onCheckedChange={(v) => setCtx((c) => ({ ...c, includeLowStock: v }))}
      />
      <SwitchField
        label="Open purchase orders"
        description="Vendor + lead-time context."
        checked={ctx.includeOpenPOs}
        onCheckedChange={(v) => setCtx((c) => ({ ...c, includeOpenPOs: v }))}
      />
      <SwitchField
        label="Recent sales delta"
        description="WoW change in revenue."
        checked={ctx.includeRecentSales}
        onCheckedChange={(v) => setCtx((c) => ({ ...c, includeRecentSales: v }))}
      />
    </div>
  )

  return (
    <PageShell
      title="AI Assistant"
      withToolbar={false}
      titleTooltip={
        <>
          Pallio AI — ask anything about your business in plain
          English: "Which SKUs are running low?", "How much did Mia
          sell last week?", "Draft a follow-up to NovaApps about
          INV-3305." Answers come from your live data within the
          scope you pick on the right.
        </>
      }
      mobileTrailing={
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Context"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-accent active:bg-accent/70"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Chat column. When the composer is focused on native iOS,
            pad the bottom by the live keyboard height so the
            composer rides above the keyboard instead of being
            obscured (capacitor.config has Keyboard.resize: Native at
            the app level; useChatKeyboard locally switches it to
            None for this route — see hook comments). */}
        <div
          // Mobile: pwa-bottom safe-area + nav (≈64 px) + page-shell
          // top bar (≈56 px) means the available chat area is
          // 100dvh - ~128 px. Going edge-to-edge reclaims the empty
          // band the user saw under the composer. Desktop has no
          // bottom nav so the math is tighter.
          className="relative flex h-[calc(100dvh-128px)] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[calc(100dvh-180px)]"
          style={{
            paddingBottom: kb.composerFocused ? kb.kbHeight : 0,
            transition: "padding-bottom 200ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {/* Header — single line on mobile. The brand icon + name +
              scope all fit on one row; "New" and the bookmark are
              icon-only so the row never wraps. */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-500 text-white shadow-sm shadow-brand/30">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
                <span className="text-sm font-semibold">Pallio AI</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  · {ctx.org} · {ctx.loc}
                </span>
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={resetThread} className="h-8 w-8" title="New thread">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={saveLastQuery} className="h-8 w-8" title="Save last prompt">
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 [&>div:last-child]:mb-1">
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className={cn("mb-3 flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  {m.role === "assistant" && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-primary/15 dark:text-primary">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-[1.55] shadow-sm",
                      m.role === "user"
                        ? "bg-brand text-brand-foreground dark:bg-primary dark:text-primary-foreground rounded-br-md"
                        : "bg-background text-foreground border border-border rounded-bl-md",
                    )}
                  >
                    {m.content ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : m.pending ? (
                      <TypingDots />
                    ) : null}
                    {m.role === "assistant" && m.content && !m.pending && (
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(m.content)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    )}
                  </div>
                  {m.role === "user" && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <UserIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Suggestion chips — one horizontally-scrollable row so it
              never eats vertical real estate. Containing div clips
              the overflow so the scroller can't bleed into the page
              width. */}
          {msgs.length <= 2 && (
            <div className="overflow-hidden border-t border-border bg-muted/20">
              <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 scrollbar-hide">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Try
                </span>
                {SUGGESTIONS.map((s) => {
                  const Icon = s.Icon
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.prompt)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:border-brand/40 hover:bg-accent"
                    >
                      <Icon className="h-3 w-3 text-brand dark:text-primary" />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Composer */}
          <div
            {...kb.composerZoneProps}
            className={cn("border-t border-border bg-card p-3", kb.composerZoneProps.className)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="Ask anything about your data…"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button
                type="submit"
                disabled={!text.trim() || busy}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Press Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>

        {/* Right rail — context + saved */}
        <aside className="hidden flex-col gap-3 lg:flex">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Context</p>
            <div className="mt-3">{renderSettings}</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved prompts</p>
              <span className="text-[11px] text-muted-foreground">{saved.length}</span>
            </div>
            {saved.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Tap the bookmark icon above to save a prompt for re-use.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {saved.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => send(s)}
                      className="group flex w-full items-start gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-left text-xs hover:border-brand/40"
                    >
                      <BookmarkCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand dark:text-primary" />
                      <span className="line-clamp-2 flex-1">{s}</span>
                      <Plus className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile settings sheet */}
      <BottomSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Context"
        description="Scope what Pallio AI can see when answering."
      >
        <div className="pb-3">{renderSettings}</div>
      </BottomSheet>
    </PageShell>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:240ms]" />
    </span>
  )
}
