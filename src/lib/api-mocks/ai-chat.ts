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

export async function aiChat({ prompt, context }: AiChatRequest): Promise<AiChatResponse> {
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
