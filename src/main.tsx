import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { kv } from "./lib/storage/kv"
import "./index.css"

// Native-only: copy any Preferences-only keys back into localStorage
// so the sync readers in src/lib/pos/storage.ts + team chat see the
// full set on first render. Fire-and-forget — the consumers tolerate
// an empty initial read (drafts simply look empty for ~1 frame), and
// hydration completes well before any user-driven write.
kv.hydrate()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
