"use client"

import * as React from "react"
import { PageShell } from "@/components/page-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/auth/role-guard"
import { Trash2, X } from "lucide-react"

type Message = { id: string; author: string; text: string; ts: number; channel: string }

const KEY = "team:chat"
const CHANNELS = ["general", "sales", "marketing"] as const
type Channel = (typeof CHANNELS)[number]

function getMessages(): Message[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Message[]) : []
  } catch {
    return []
  }
}
function setMessages(msgs: Message[]) {
  localStorage.setItem(KEY, JSON.stringify(msgs))
}

export default function TeamChatPage() {
  const [author, setAuthor] = React.useState("TeamMember")
  const [text, setText] = React.useState("")
  const [channel, setChannel] = React.useState<Channel>("general")
  const [messages, setMsgs] = React.useState<Message[]>(getMessages)

  React.useEffect(() => {
    const handler = () => setMsgs(getMessages())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const visible = messages.filter((m) => m.channel === channel)

  function send() {
    if (!text.trim()) return
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      author: author.trim() || "Anonymous",
      text: text.trim(),
      ts: Date.now(),
      channel,
    }
    const next = [msg, ...messages]
    setMsgs(next)
    setMessages(next)
    setText("")
  }

  function remove(id: string) {
    const next = messages.filter((m) => m.id !== id)
    setMsgs(next)
    setMessages(next)
  }

  function clearChannel() {
    const next = messages.filter((m) => m.channel !== channel)
    setMsgs(next)
    setMessages(next)
  }

  return (
    <RoleGuard permission="view:team">
      <PageShell title="Team — Chat" withToolbar>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Team Chat</CardTitle>
            <CardDescription>Channels and quick team communication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Channel tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="max-w-xs"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <div className="ml-auto flex items-center gap-2">
                {CHANNELS.map((c) => (
                  <Button
                    key={c}
                    variant={c === channel ? "default" : "outline"}
                    className={c === channel ? "bg-violet-600 hover:bg-violet-600/90" : ""}
                    onClick={() => setChannel(c)}
                  >
                    #{c}
                  </Button>
                ))}
                <Button variant="outline" onClick={clearChannel} title="Clear channel">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[50vh] overflow-auto rounded-lg border p-3">
              {visible.length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
              <div className="space-y-3">
                {visible.map((m) => (
                  <div key={m.id} className="rounded-md border p-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {m.author} • #{m.channel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(m.ts).toLocaleString()}</span>
                        <button
                          className="rounded p-1 hover:bg-accent"
                          aria-label="Delete message"
                          onClick={() => remove(m.id)}
                          title="Delete"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-sm">{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Message #${channel}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button onClick={send}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </PageShell>
    </RoleGuard>
  )
}
