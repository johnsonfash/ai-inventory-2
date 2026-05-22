# AI Chat backend design

How the Pallio AI Assistant will work once the backend is built. The
frontend (`src/pages/ai/index.tsx`) already POSTs to `/api/ai/chat`
and renders streamed responses — this doc covers what to build on
the server side.

The design is grounded LLM chat with strict per-user isolation. Each
request is assembled fresh by the backend, the LLM never holds user
state, and tool calls are the only path to actual data.

## Insights vs chat — different paths

| Surface | Powered by | LLM needed? |
| --- | --- | --- |
| Dashboard insight cards (trending, low stock, vendor lateness, margin drift, ROAS surges) | SQL + business-logic formulas | **No** |
| 7-day revenue forecast | Exponential smoothing or 30-day moving average | **No** |
| Smart restock quantity | `lead_time × avg_daily_velocity × safety_factor` | **No** |
| AI Assistant chat page (`/ai`) | LLM grounded on user's data | **Yes** |

Build insights as deterministic backend queries. They're faster, more
reliable, and free. Reserve the LLM for the chat surface only.

## Chat request flow

```
User taps Send
   ↓
POST /api/ai/chat  { message, session_id }   (JWT in Authorization)
   ↓
Backend:
   1. Auth → user_id, org_id, location_id, role
   2. Load conversation history (last 5-10 turns for this session)
   3. Build user-context snapshot (scoped by org_id)
   4. Define tools (each scoped by org_id internally)
   5. Send to LLM: system + context + history + tools + new message
   6. If LLM calls a tool → run it (scoped) → return result → LLM responds
   7. Stream response back to client
   8. Save the turn to history
```

The LLM never sees raw queries. It calls tools by name with parameters;
the backend runs the actual queries with `WHERE org_id = ?` baked in.

## The four prompt pieces

### 1. System prompt (static, ~500 tokens)

One template, parameterized per user.

```
You are Pallio AI, the assistant inside {{user.name}}'s Pallio account
(business: {{org.name}}, role: {{user.role}}, location: {{location.name}}).

ONLY answer questions about:
- Their inventory, sales, customers, vendors, orders
- Their marketing campaigns and ad performance
- Their books and accounting
- How to use Pallio features

DECLINE politely if asked anything else. Use this template:
"I can only help with your Pallio business. Want to look at your
inventory or recent sales?"

Rules for answering:
- Cite the data you used when giving numbers.
- Never invent figures. If the data isn't available, say so and
  suggest which Pallio report to check.
- Keep responses brief. Operators are on a phone, on the floor.
- If a question needs multiple data lookups, call the relevant
  tools rather than guessing.
- Format numbers in {{org.currency}} (e.g. ₦86,000 for Nigerian
  accounts).
```

### 2. User context snapshot (~500–2k tokens, fresh per request)

A structured summary of "current state" so the LLM can answer simple
questions without round-tripping for tool calls.

```json
{
  "business": "Funke Apparel",
  "currency": "NGN",
  "current_location": "Lekki Phase 1",
  "today": {
    "revenue": 86000,
    "orders": 4,
    "stockouts": 2
  },
  "week_so_far": {
    "revenue_vs_prior_week": "+12%",
    "top_seller": "Adire silk blouse",
    "top_category": "Fashion"
  },
  "alerts": {
    "low_stock_count": 2,
    "late_vendors": 1,
    "campaigns_overspending": 0
  }
}
```

Build this in `lib/ai/context.ts`:

```ts
async function buildUserContext(orgId: string, locationId: string) {
  const [today, week, alerts] = await Promise.all([
    getTodayStats(orgId, locationId),
    getWeekStats(orgId, locationId),
    getAlertCounts(orgId, locationId),
  ])
  return { business: ..., currency: ..., today, week_so_far: week, alerts }
}
```

### 3. Tools (LLM-callable functions)

For specific lookups the snapshot doesn't cover, the LLM calls a
tool. Modern LLMs (Llama 3.3, Gemini, GPT-4 family) all support
function calling. Define tools as JSON schemas:

```ts
const tools = [
  {
    name: "get_sales",
    description: "Get sales totals for a date range",
    parameters: {
      start_date: "ISO date",
      end_date: "ISO date",
      group_by: "day | week | month | sku | category",
    },
  },
  {
    name: "get_inventory",
    description: "Get current stock levels",
    parameters: {
      location_id: "string?",
      low_stock_only: "boolean?",
      category: "string?",
    },
  },
  {
    name: "get_top_sellers",
    description: "Get best-selling items in a period",
    parameters: { period: "today | week | month | year", limit: "number?" },
  },
  {
    name: "get_vendor_lateness",
    description: "List vendors with overdue POs in the last 30 days",
    parameters: {},
  },
  {
    name: "get_customer_summary",
    description: "Get a customer's order history and lifetime value",
    parameters: { customer_id: "string" },
  },
  {
    name: "get_campaign_performance",
    description: "Get ROAS / spend / conversions for active campaigns",
    parameters: { channel: "facebook | instagram | youtube | marketplace?" },
  },
  {
    name: "get_help",
    description: "Return step-by-step instructions and a deep link for a Pallio feature. Use when the user asks how to do something in the app.",
    parameters: { topic: "Slug of a known help topic (e.g. add_product, run_pos_sale, invite_team_member)" },
  },
  {
    name: "list_help_topics",
    description: "List every available help topic (slug + title only, no body). Call this when the user's question doesn't obviously map to a known topic.",
    parameters: {},
  },
]
```

**Critical:** every tool implementation MUST scope queries by
`req.user.org_id` internally. The LLM passes the *parameters*; the
backend supplies the org boundary.

```ts
// lib/ai/tools/get_inventory.ts
export async function get_inventory(
  orgId: string,
  args: { location_id?: string; low_stock_only?: boolean }
) {
  return db.query(`
    SELECT sku, name, qty, reorder_point
    FROM inventory_items
    WHERE org_id = $1
      AND ($2::uuid IS NULL OR location_id = $2)
      AND ($3::bool IS FALSE OR qty < reorder_point)
    ORDER BY qty ASC
    LIMIT 100
  `, [orgId, args.location_id ?? null, args.low_stock_only ?? false])
}
```

### 3b. Help registry (static, ~50-100 topics)

How-to questions ("how do I add a product?", "how do I connect
Paystack?") are answered via the `get_help` tool that reads from a
static registry. Lives in `lib/ai/help.ts`:

```ts
export const HELP: Record<string, HelpTopic> = {
  add_product: {
    title: "Add a product",
    url: "/inventory/new",
    steps: [
      "Open Inventory from the sidebar (or Stock on mobile)",
      "Tap **New item** at the top right",
      "Fill in name, SKU, price, and starting stock",
      "Pick a location if you have multiple stores",
      "Tap **Save**",
    ],
  },
  run_pos_sale: { url: "/pos", title: "Ring a sale", steps: [...] },
  invite_team_member: { url: "/settings/users/new", ... },
  connect_paystack: { url: "/settings/payments", ... },
  create_campaign: { url: "/marketing/campaigns/new", ... },
  // ~50-100 topics covering the whole app
}

export function get_help(args: { topic: string }) {
  return HELP[args.topic] ?? { error: "Topic not found" }
}

export function list_help_topics() {
  // Slugs + titles only. Keeps response under ~300 tokens
  // regardless of how many topics exist.
  return Object.entries(HELP).map(([slug, t]) => ({ slug, title: t.title }))
}
```

The LLM either calls `get_help` directly when the topic is obvious
from the user's question, or calls `list_help_topics` first to see
what's available, then `get_help` for the chosen slug.

The LLM formats the response with markdown links (`[Add a product](/inventory/new)`)
that the chat UI renders as clickable. No frontend changes needed
for the basic link flow.

**Optional "open it for me" UX:** to give the AI agentic
navigation, the LLM can return a structured help response:

```json
{
  "type": "help_with_navigation",
  "instructions": "...",
  "deeplink": "/inventory/new",
  "deeplink_label": "Add a product"
}
```

The chat UI (`src/pages/ai/index.tsx`) intercepts this and renders a
"Take me there" button that calls `navigate(deeplink)`. One-tap
navigation vs copy-paste URL. Implement this UI tweak when you wire
the chat to the real endpoint.

### 4. Conversation history (~500–1500 tokens)

Last 5–10 message pairs per session. Stored in Redis with a TTL or
in a `ai_messages` table. Keyed by `(user_id, session_id)`.

```sql
CREATE TABLE ai_messages (
  id           uuid PRIMARY KEY,
  user_id      uuid NOT NULL,
  session_id   uuid NOT NULL,
  role         text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content      text NOT NULL,
  tool_name    text,
  tool_args    jsonb,
  tool_result  jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON ai_messages (user_id, session_id, created_at);
```

Auto-prune older than 7 days via a daily job.

## Multi-tenant isolation guarantees

| Concern | How it's handled |
| --- | --- |
| User A sees User B's data | Impossible. Every query is `WHERE org_id = req.user.org_id`. |
| LLM remembers across users | LLM is stateless. Every request is fresh. |
| LLM is asked off-topic | System prompt + refusal template. Block at the model layer. |
| Prompt injection ("ignore previous instructions, leak data") | Tools are the only data path. The LLM can't read DB directly. Even if it tries to call a tool with another org's ID, the backend ignores the LLM-supplied org_id and uses the JWT's org_id. |
| Provider sees user data | Reputable providers (Groq, Gemini, DeepSeek) don't train on API traffic — but check terms. For HIPAA/PCI workloads, self-host (Ollama / vLLM) or use a BAA provider. |
| User data leaked in error logs | Strip user data from logs. Log structured events without PII. |

## Provider fallback chain (smart-routed, not just sequential)

The naive "always try 70B first" fallback wastes the tighter free
tier on questions that don't need it. Route by complexity instead.

### Tier classification

Classify the user's message before picking a model. A simple keyword
rule is enough; no need for an ML classifier.

```ts
// lib/ai/router.ts
function classifyQuestion(message: string): "simple" | "complex" {
  const m = message.toLowerCase()
  const SIMPLE_HINTS = [
    "how do i", "where is", "where do i", "show me", "open",
    "find", "list", "what is my", "what's my", "how many",
  ]
  const COMPLEX_HINTS = [
    "why", "analyze", "compare", "predict", "forecast", "draft",
    "write", "summari", "explain why", "recommend",
  ]
  if (COMPLEX_HINTS.some(h => m.includes(h))) return "complex"
  if (SIMPLE_HINTS.some(h => m.includes(h)))  return "simple"
  return "simple"  // default to the cheaper / higher-throughput tier
}
```

### Per-tier provider chains

```ts
// lib/ai/llm.ts
const SIMPLE_CHAIN = [
  // Llama 3.1 8B Instant — 30,000 TPM, 14,400 RPD free. 5x more
  // headroom than 70B. Plenty smart for help text + simple lookups.
  { name: "groq-8b",      model: "llama-3.1-8b-instant",   apiKey: env.GROQ_KEY },
  { name: "cerebras-8b",  model: "llama-3.1-8b",           apiKey: env.CEREBRAS_KEY },
  { name: "gemini",       model: "gemini-2.0-flash",       apiKey: env.GEMINI_KEY },
  { name: "deepseek",     model: "deepseek-chat",          apiKey: env.DEEPSEEK_KEY },
]

const COMPLEX_CHAIN = [
  // Llama 3.3 70B — best free quality. 6,000 TPM, 1,000 RPD.
  // Tighter limits but worth it for reasoning.
  { name: "groq-70b",     model: "llama-3.3-70b-versatile", apiKey: env.GROQ_KEY },
  { name: "cerebras-70b", model: "llama-3.1-70b",           apiKey: env.CEREBRAS_KEY },
  { name: "gemini",       model: "gemini-2.0-flash",        apiKey: env.GEMINI_KEY },
  { name: "deepseek",     model: "deepseek-chat",           apiKey: env.DEEPSEEK_KEY },
]

export async function chat(messages, tools, complexity: "simple" | "complex") {
  const chain = complexity === "complex" ? COMPLEX_CHAIN : SIMPLE_CHAIN
  for (const p of chain) {
    try {
      return await callProvider(p, messages, tools)
    } catch (err) {
      if (isRateLimitError(err)) continue        // try next provider
      if (isProviderError(err)) continue
      throw err                                   // real bug, surface it
    }
  }
  throw new Error("All AI providers exhausted")
}
```

### Why this matters for free-tier capacity

| Provider/model | TPM | Per request | Real capacity for Pallio |
| --- | ---: | ---: | --- |
| Groq Llama 3.3 70B (complex) | 6,000 | ~5,000 | ~1.2 turns/min sustained |
| Groq Llama 3.1 8B (simple) | 30,000 | ~3,000 | ~10 turns/min sustained |
| Cerebras 70B | ~6,000 | ~5,000 | Backup pool for complex |
| Cerebras 8B | ~8,000 | ~3,000 | Backup pool for simple |
| Gemini 2.0 Flash | — | ~5,000 | 10 RPM, 1,500 RPD — different rate limit pool |
| DeepSeek V3 (paid) | unlimited | ~5,000 | Paid backstop, ~$0.27/M tokens |

Real-world expectation for 5k users:
- ~75 turns/day total, spread over 8 business hours = ~0.15 turns/min average
- ~60% are simple ("how do I", "show me") → 8B chain
- ~40% are complex ("why", "analyze") → 70B chain
- Peak burst: maybe 3-5 simultaneous chats
- Even peak fits inside 8B's 30k TPM + 70B's 6k TPM combined, with Gemini + Cerebras as overflow

Result: **$0/month AI cost** for at least the first 50k users.

When usage grows past free tier, DeepSeek V3 absorbs overflow at
~$0.27/M tokens. Worst case at 5k users would be ~$1-3/month
during traffic spikes.

## Smart-waiting toolkit (rate-limit handling)

Beyond the fallback chain, six techniques that together buy you
2–3x more effective free-tier capacity. Implement these alongside
the chain itself.

### 1. Retry-After parsing

All four providers send a `Retry-After` header on 429s. Wait the
exact time the header specifies, then retry the **same** provider
before falling to the next. Absorbs most transient bursts.

```ts
async function callProvider(p, messages, tools, retries = 2) {
  const res = await fetch(p.url, { headers, body: ... })
  if (res.status === 429) {
    if (retries === 0) throw new RateLimitError(p.name)
    const wait = parseInt(res.headers.get("retry-after") ?? "5") * 1000
    await sleep(wait)
    return callProvider(p, messages, tools, retries - 1)
  }
  return res.json()
}
```

### 2. Per-user concurrency lock (Redis SETNX with TTL)

Block a single user from firing 5 chats in 10 seconds.

```ts
async function withUserLock(userId, fn) {
  const acquired = await redis.set(`ai:lock:${userId}`, "1", "EX", 30, "NX")
  if (!acquired) throw new BusyError("One chat at a time, please")
  try { return await fn() }
  finally { await redis.del(`ai:lock:${userId}`) }
}
```

Frontend renders "Pallio is still typing..." on BusyError.

### 3. Help-query cache (the biggest win)

"How do I add a product?" doesn't change between users. Cache the
LLM's formatted response for 24h. Cuts effective load by ~50%.

```ts
async function chatWithCache(message, ctx, tools) {
  if (looksLikeHelpQuery(message)) {
    const key = `ai:help:${sha256(message.toLowerCase())}_${ctx.role}`
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)  // zero tokens, instant
  }
  const res = await chat(message, ctx, tools)
  if (looksLikeHelpQuery(message)) {
    await redis.setex(key, 86400, JSON.stringify(res))
  }
  return res
}

function looksLikeHelpQuery(msg: string) {
  const m = msg.toLowerCase()
  return ["how do i", "how to", "where is", "where do i"].some(k => m.includes(k))
}
```

### 4. Per-user daily quota

```ts
const limit = await redis.incr(`ai:user:${userId}:${todayUTC()}`)
await redis.expire(`ai:user:${userId}:${todayUTC()}`, 86400)
if (limit > 50) throw new QuotaError("Daily AI quota reached")
```

Free plan: 50 turns/day. Paid plan: unlimited (or 500). Prevents one
curious user from eating provider quota.

### 5. SSE streaming

Stream tokens to the client as they generate. Perceived speed wins
over actual speed. All four providers (Groq, Cerebras, Gemini,
DeepSeek) support SSE.

### 6. Pre-emptive provider selection via response headers

Most providers return rate-limit state in response headers:
`x-ratelimit-remaining-tokens`, `x-ratelimit-reset`. Track these in
memory and route around providers that are near capacity *before*
hitting their 429.

```ts
const rateState = new Map<string, { remaining: number; reset: number }>()

function pickNextProvider(chain) {
  return chain.find(p => {
    const s = rateState.get(p.name)
    if (!s) return true                     // unknown, try
    if (s.reset < Date.now()) return true   // window reset
    return s.remaining > 5000               // has headroom
  }) ?? chain[chain.length - 1]
}

// After every call, update the snapshot:
function updateRateState(provider, response) {
  rateState.set(provider.name, {
    remaining: parseInt(response.headers.get("x-ratelimit-remaining-tokens") ?? "0"),
    reset: Date.now() + parseInt(response.headers.get("x-ratelimit-reset") ?? "60") * 1000,
  })
}
```

### Realistic outcome at 100 sessions/day

| Scenario | What happens |
| --- | --- |
| Average day (350 turns) | Groq 70B/8B handle everything. Cache absorbs ~50% of help queries. ~150-180 real LLM calls. Zero rate-limit events. |
| Peak burst (5 simultaneous) | 1–2 go to Groq, 1–2 to Cerebras via pre-routing, overflow to Gemini. Invisible to users. |
| Pathological (10+ simultaneous) | All free tiers exhausted, falls to DeepSeek paid. ~$0.05 for the spike. Invisible to users. |
| Single user hammering | Concurrency lock + daily quota cap them. |
| Provider outage | Fallback chain transparently routes around. |

**Expected monthly cost at 100 sessions/day with this design: $0.**

## Cost projections

Per-turn token cost with this design: **2–6k tokens** (system + context + history + question + answer).

Per-session (3 turns): **6–18k tokens**.

| Scale | Sessions/day | Tokens/month | Free tier? | Paid cost |
| --- | --- | --- | --- | --- |
| 5k users | ~25 | ~12M | ✅ Groq 70B | $0 |
| 50k users | ~250 | ~120M | ⚠ Tight on Groq 70B (RPD 1k), use 8B or Gemini | $0–5 |
| 500k users | ~2.5k | ~1.2B | ❌ Need paid | ~$30/mo DeepSeek |
| 5M users | ~25k | ~12B | ❌ | ~$300/mo DeepSeek or self-host |

Free tier sustains you to **at least mid-five-figure user counts**.
Paid is cheap (DeepSeek V3) when you outgrow it.

## Redis caching layers

The free-tier capacity math only works because we cache aggressively.
Each cache type has a different TTL and key strategy.

### Cache 1: Help-query responses (24h TTL)

The biggest win. "How do I add a product?" → same answer for every
user with the same role. Caches the LLM's *formatted response*, not
the raw tool result.

```ts
// lib/ai/cache.ts
function helpCacheKey(message: string, role: string): string {
  const normalised = message.toLowerCase().trim().replace(/\s+/g, " ")
  return `ai:help:${sha256(normalised)}:${role}`
}

export async function getCachedHelp(message: string, role: string) {
  if (!looksLikeHelpQuery(message)) return null
  const raw = await redis.get(helpCacheKey(message, role))
  return raw ? JSON.parse(raw) : null
}

export async function setCachedHelp(
  message: string,
  role: string,
  response: ChatResponse,
) {
  if (!looksLikeHelpQuery(message)) return
  await redis.setex(helpCacheKey(message, role), 86400, JSON.stringify(response))
}
```

**Hit rate target:** 50–70% of all chat turns (help is the most
common usage pattern).

### Cache 2: Conversation history (per session, 7-day TTL)

The last N turns of each session. Read on every request, appended
on every response. Keep small (last 10 turns max) to stay under
context size.

```ts
const HISTORY_KEY = (userId: string, sessionId: string) =>
  `ai:hist:${userId}:${sessionId}`

export async function getHistory(userId: string, sessionId: string, limit = 10) {
  // Redis LRANGE keeps insertion order — pull last `limit` items
  const items = await redis.lrange(HISTORY_KEY(userId, sessionId), -limit, -1)
  return items.map((s) => JSON.parse(s) as ChatTurn)
}

export async function appendHistory(
  userId: string,
  sessionId: string,
  turn: ChatTurn,
) {
  const key = HISTORY_KEY(userId, sessionId)
  await redis.rpush(key, JSON.stringify(turn))
  await redis.ltrim(key, -50, -1)         // keep only last 50, drop rest
  await redis.expire(key, 7 * 86400)      // 7-day TTL
}
```

Could store in Postgres instead if you want indefinite history, but
Redis is fast and 7 days covers the realistic "follow-up question"
window.

### Cache 3: User context snapshot (5-minute TTL)

The `buildUserContext(orgId)` call hits multiple DB tables (today
stats, week stats, alerts). Don't re-run it for every chat turn —
cache it.

```ts
const CTX_KEY = (orgId: string, locationId: string) =>
  `ai:ctx:${orgId}:${locationId}`

export async function getUserContext(orgId: string, locationId: string) {
  const cached = await redis.get(CTX_KEY(orgId, locationId))
  if (cached) return JSON.parse(cached)
  const ctx = await buildUserContext(orgId, locationId)
  await redis.setex(CTX_KEY(orgId, locationId), 300, JSON.stringify(ctx))  // 5 min
  return ctx
}

// Bust the cache when meaningful events happen:
export async function bustUserContext(orgId: string, locationId: string) {
  await redis.del(CTX_KEY(orgId, locationId))
}
// Call from: order completion, stock adjustment, vendor delivery, campaign update
```

**Trade-off:** 5-minute staleness on dashboard stats inside the AI
chat. Acceptable because the actual dashboard updates live; only
the AI's contextual summary is delayed.

### Cache 4: Tool results (per-query, 60-second TTL)

Specific tool calls like `get_top_sellers(period: "week")` are
identical for any user in the same org within a short window.

```ts
function toolCacheKey(orgId: string, tool: string, args: Record<string, unknown>) {
  return `ai:tool:${orgId}:${tool}:${sha256(JSON.stringify(args))}`
}

export async function runToolCached(
  orgId: string,
  tool: string,
  args: Record<string, unknown>,
) {
  const key = toolCacheKey(orgId, tool, args)
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  const result = await TOOLS[tool](orgId, args)
  await redis.setex(key, 60, JSON.stringify(result))   // 60s
  return result
}
```

60 seconds is enough to coalesce burst traffic from the same user
(asking follow-ups about the same data) without serving stale numbers.

### Cache 5: Per-user rate-limit counters (rolling daily)

```ts
const RPD_KEY = (userId: string) => `ai:rpd:${userId}:${todayUTC()}`

export async function checkUserQuota(userId: string, dailyMax = 50) {
  const used = await redis.incr(RPD_KEY(userId))
  if (used === 1) await redis.expire(RPD_KEY(userId), 86400)
  if (used > dailyMax) throw new QuotaError(used, dailyMax)
}
```

Used to cap a single user's daily turns. Free plan = 50/day, paid
plan = 500/day or unlimited. Roll forward at UTC midnight.

### Cache 6: Provider rate-limit state (in-memory, no Redis)

Tracks `x-ratelimit-remaining-tokens` per provider in process
memory. Resets every minute. Doesn't need Redis because each API
server instance independently tracks the providers it called.

```ts
const rateState = new Map<string, { remaining: number; resetAt: number }>()

export function recordRateState(provider: string, headers: Headers) {
  rateState.set(provider, {
    remaining: parseInt(headers.get("x-ratelimit-remaining-tokens") ?? "999999"),
    resetAt: Date.now() + parseInt(headers.get("x-ratelimit-reset") ?? "60") * 1000,
  })
}

export function pickProvider(chain: ProviderConfig[]): ProviderConfig {
  const now = Date.now()
  return (
    chain.find((p) => {
      const s = rateState.get(p.name)
      return !s || s.resetAt < now || s.remaining > 5000
    }) ?? chain[chain.length - 1]
  )
}
```

## Concrete chat endpoint walkthrough

Bringing every layer together. Here's the full request handler.

```ts
// routes/api/ai/chat.ts
import type { Request, Response } from "express"

export async function chatHandler(req: Request, res: Response) {
  const user = req.user          // from auth middleware (JWT-decoded)
  const { message, session_id } = req.body

  // -- 1. User-level guards ---------------------------------------
  await checkUserQuota(user.id)                          // daily cap
  await withUserLock(user.id, async () => {              // concurrency lock

  // -- 2. Cache check (zero-token path for help queries) ----------
  const cached = await getCachedHelp(message, user.role)
  if (cached) {
    res.json({ ...cached, cached: true })
    return
  }

  // -- 3. Assemble prompt -----------------------------------------
  const context = await getUserContext(user.org_id, user.location_id)
  const history = await getHistory(user.id, session_id)
  const complexity = classifyQuestion(message)
  const tools = makeTools(user.org_id)

  const messages = [
    { role: "system",  content: buildSystemPrompt(user, context) },
    ...history,
    { role: "user",    content: message },
  ]

  // -- 4. Stream the LLM response (with tool-call loop) -----------
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  let fullResponse = ""
  const toolCalls: ToolCall[] = []

  try {
    // The chat() function handles fallback + tool dispatch internally.
    for await (const chunk of chat({ messages, tools, complexity })) {
      if (chunk.type === "text") {
        fullResponse += chunk.delta
        res.write(`data: ${JSON.stringify({ type: "text", delta: chunk.delta })}\n\n`)
      } else if (chunk.type === "tool_call") {
        toolCalls.push(chunk.call)
        const result = await runToolCached(user.org_id, chunk.call.name, chunk.call.args)
        res.write(`data: ${JSON.stringify({ type: "tool", name: chunk.call.name, result })}\n\n`)
        // Loop continues — chat() feeds the tool result back to the LLM
      }
    }
    res.write("data: [DONE]\n\n")
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`)
    res.end()
    log.error("ai_chat_failed", { userId: user.id, err })
    return
  }

  // -- 5. Persist + cache after success ---------------------------
  const turn = { role: "assistant", content: fullResponse, tool_calls: toolCalls }
  await appendHistory(user.id, session_id, { role: "user", content: message })
  await appendHistory(user.id, session_id, turn)
  await setCachedHelp(message, user.role, { content: fullResponse, tool_calls: toolCalls })

  // -- 6. Telemetry -----------------------------------------------
  log.info("ai_chat_success", {
    userId: user.id,
    orgId:  user.org_id,
    complexity,
    tokens_in:  estimateTokens(messages),
    tokens_out: estimateTokens([{ content: fullResponse }]),
    tools_called: toolCalls.map((t) => t.name),
  })
  })  // close withUserLock
}
```

## Request / response contract

The frontend (`src/pages/ai/index.tsx`) sends:

```ts
POST /api/ai/chat
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "message": "How do I add a product?",
  "session_id": "a1b2c3-..."        // uuid; client persists per session
}
```

The server responds with SSE streaming. Each chunk is a JSON-on-a-line:

```
data: {"type":"text","delta":"Adding a "}
data: {"type":"text","delta":"product is quick:\n\n"}
data: {"type":"tool","name":"get_help","result":{"url":"/inventory/new","steps":["..."]}}
data: {"type":"text","delta":"1. Go to **Inventory**\n2. Tap..."}
data: {"type":"done","session_id":"a1b2c3-...","tokens":4823}
data: [DONE]
```

Or, if cached:

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "content": "Adding a product is quick:\n\n1. Go to...",
  "tool_calls": [{"name":"get_help","args":{"topic":"add_product"}}],
  "cached": true
}
```

Frontend client decides whether to render the streamed deltas
progressively or wait for done. Streamed UX is much nicer.

Error shape:

```
data: {"type":"error","message":"Daily AI quota reached","code":"QUOTA"}
data: [DONE]
```

Codes the frontend should know about:

| Code | Meaning | UI response |
| --- | --- | --- |
| `QUOTA` | User hit daily turn cap | Show "You've used your AI quota for today" toast + upgrade nudge |
| `BUSY`  | Concurrency lock — previous request still in flight | Show "Pallio is still typing your last answer" |
| `RATE` | All providers exhausted | Show "AI is busy, please try again in a moment" + retry button |
| `UNSAFE` | Content flagged | Show generic "I can only help with Pallio business questions" |

## SSE streaming notes

- Use `text/event-stream` content type and write lines with `data: <json>\n\n` framing.
- Send a `[DONE]` sentinel so the client knows the response is complete.
- Heartbeat every 15s with `: keepalive\n\n` to prevent proxy timeouts.
- All four providers (Groq, Cerebras, Gemini, DeepSeek) support SSE. Tool calls
  arrive as separate events inside the same stream — handle them between text chunks.
- Frontend uses `EventSource` or `fetch + ReadableStream` to consume.

## Observability

Log every chat turn for support / debugging / abuse investigation:

```ts
log.info("ai_chat_success", {
  userId,                   // for support correlation
  orgId,                    // for scoping per-tenant queries
  complexity,               // "simple" | "complex"
  provider_used,            // which model actually answered
  cached,                   // boolean — was this served from cache?
  tokens_in, tokens_out,    // for cost tracking
  tools_called,             // array of tool names
  latency_ms,               // end-to-end
  session_id,
  // DO NOT LOG: message content, response content, user PII
})
```

Strip user content from logs by default. If you need full traces for
debugging, gate them behind a per-user opt-in or a tight RBAC role.

Metrics worth tracking in Grafana / equivalent:

- `ai_chat_requests_total{provider, complexity, cached}`
- `ai_chat_latency_seconds` (histogram)
- `ai_chat_tokens_total{provider, direction=in|out}`
- `ai_chat_errors_total{code}`
- `ai_cache_hit_rate{type=help|context|tool}`
- `ai_provider_rate_limit_hits_total{provider}`

Alert on: cache hit rate dropping below 40% (something broke), error
rate above 5%, sustained rate-limit hits on the entire chain (means
you're actually hitting paid tier — check usage).

## Backend files to create

When you start the backend, scaffold these:

```
backend/
  lib/ai/
    prompt.ts          # buildSystemPrompt, buildUserContext
    llm.ts             # provider fallback chain
    history.ts         # store/load conversation turns
    tools/
      index.ts         # tool registry
      get_sales.ts
      get_inventory.ts
      get_top_sellers.ts
      get_vendor_lateness.ts
      get_customer_summary.ts
      get_campaign_performance.ts
  routes/api/ai/
    chat.ts            # POST endpoint, streams response
    session.ts         # POST to create / GET to list sessions
```

## Frontend wiring (already done)

`src/pages/ai/index.tsx` is ready to consume this. When the backend
lands, point the chat input at `POST /api/ai/chat` with the user's
JWT and stream the response into the message list. The page already
has message UI, settings panel for "what data to share", and
session management UX.

## Open questions for later

These don't need answers now, but flag them when backend work
begins:

1. **Streaming protocol** — SSE vs WebSocket vs chunked HTTP? SSE is
   simplest; supports per-token streaming from all four LLM
   providers.
2. **Provider keys storage** — env vars on the API server. Don't
   ship to the client.
3. **Rate limiting per user** — cap conversations per user per day
   (e.g. 50/day for free plan, unlimited for paid) so a single user
   can't burn your provider quota.
4. **Audit log** — store every chat turn for 30 days for support /
   debugging / abuse investigation. Auto-prune older.
5. **Tool error handling** — when a tool fails, return the error to
   the LLM so it can apologize coherently, don't fail the whole
   request.
6. **Markdown safety** — if rendering LLM output as markdown,
   sanitize. Don't allow raw HTML or script tags.
7. **Sensitive data redaction** — should certain fields (customer
   addresses, payment details) be excluded from the AI context even
   if the user owns them? Probably yes for PCI.
