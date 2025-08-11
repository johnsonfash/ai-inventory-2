import { type NextRequest, NextResponse } from "next/server"
// Optional: wire AI SDK here with your provider keys later. See docs [^3].
// import { generateText } from "ai"
// import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  const { prompt, context } = await req.json()
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

  // Example to go live later:
  /*
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are an inventory analyst assistant. Be concise and actionable.",
    prompt: `${prompt}\n\n${ctxBits}`,
  })
  return NextResponse.json({ reply: text })
  */

  return NextResponse.json({ reply })
}
