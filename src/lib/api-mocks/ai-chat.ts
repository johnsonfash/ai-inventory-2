import { api } from "@/lib/api/client"

export type AiChatContext = {
  org?: string
  loc?: string
  includeLowStock?: boolean
  includeOpenPOs?: boolean
  includeRecentSales?: boolean
}

export type AiChatRequest = {
  prompt: string
  context?: AiChatContext
}

export type AiChatResponse = {
  reply: string
}

// Reference implementation of the swap pattern. When the real backend
// lands AND VITE_API_BASE_URL is set, calls go to /ai/chat. Otherwise
// returns the local fake — keeps the /ai page useful during dev and
// in the demo deploy.
//
// To migrate the rest of api-mocks/* once the backend is up:
//   1. Confirm api.isConfigured() returns true in the target env.
//   2. Replace the `if (!api.isConfigured()) { ...local mock... }`
//      block with the api.post call below.
//   3. Drop any extra dummy types/helpers the local mock used.
export async function aiChat({ prompt, context }: AiChatRequest): Promise<AiChatResponse> {
  if (api.isConfigured()) {
    return api.post<AiChatResponse>("/ai/chat", { prompt, context })
  }

  // Local fake. The reply is deterministic-ish on the input so the
  // UI feels live during dev.
  const ctxBits = [
    context?.org ? `Organization: ${context.org}` : "",
    context?.loc ? `Location: ${context.loc}` : "",
    context?.includeLowStock ? "Including low stock snapshot." : "",
    context?.includeOpenPOs ? "Including open purchase orders." : "",
    context?.includeRecentSales ? "Including recent sales delta." : "",
  ]
    .filter(Boolean)
    .join(" ")

  const reply =
    `Here's what I found.\n\n` +
    `• ${ctxBits}\n` +
    `• For stock insights, open Reporting — Stock and Inventory — Items.\n` +
    `• For purchases, check Purchasing — Purchase Orders and Receipts.\n\n` +
    `Answer based on your prompt: ${String(prompt ?? "").slice(0, 300)}`

  return { reply }
}
