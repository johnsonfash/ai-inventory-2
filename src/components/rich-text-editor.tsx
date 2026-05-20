import * as React from "react"
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Type,
  Undo2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  /** Controlled HTML value. */
  value: string
  /** Fires with serialized HTML on every input. */
  onChange: (html: string) => void
  /** Placeholder text shown when empty (CSS :empty trick). */
  placeholder?: string
  className?: string
  /** Minimum visible height. */
  minHeight?: number
  /** Optional id so an external <label htmlFor> can target it. */
  id?: string
  /** ARIA label when there's no visible label. */
  "aria-label"?: string
}

// Lightweight rich-text editor used by the comms composer + future
// places that need formatted body content (e.g. invoice notes,
// product long descriptions).
//
// Deliberately built on `contentEditable` + `document.execCommand`
// rather than tiptap / lexical / slate. Yes, execCommand is
// deprecated — but for the small set of formatting commands Pallio
// actually uses (bold, italic, lists, link, h2, quote) it still
// works in every browser we target, including iOS Safari + the
// Capacitor WKWebView. The trade-off: no collaborative editing, no
// pluggable schema. Worth it for the kilobytes we save vs tiptap.
//
// The editor stays uncontrolled internally (contentEditable owns
// the DOM) but pushes HTML up through `onChange` on every input.
// To avoid reset-cursor flicker we only write back to the DOM when
// the incoming `value` differs from the editor's current innerHTML
// — typical React-controlled-but-not-really pattern for
// contentEditable.
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something…",
  className,
  minHeight = 180,
  id,
  ...rest
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null)

  // Sync external `value` → DOM when they diverge. We intentionally
  // skip this when the editor is focused so a typing user doesn't
  // get their cursor reset on every keystroke.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement === el) return
    if (el.innerHTML !== value) el.innerHTML = value
  }, [value])

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(cmd, false, arg)
    // Notify after the DOM has the new state.
    requestAnimationFrame(() => onChange(ref.current?.innerHTML ?? ""))
  }

  const wrapHeading = () => {
    // Convert the current block to <h2> via formatBlock.
    exec("formatBlock", "<h2>")
  }

  const wrapBlockquote = () => {
    exec("formatBlock", "<blockquote>")
  }

  const wrapParagraph = () => {
    exec("formatBlock", "<p>")
  }

  const insertLink = () => {
    const sel = window.getSelection()?.toString() || ""
    const url = window.prompt("Link URL", "https://")
    if (!url) return
    if (sel) {
      exec("createLink", url)
    } else {
      // No selection — insert the URL as the visible label.
      exec("insertHTML", `<a href="${escapeAttr(url)}" rel="noopener noreferrer">${escapeHtml(url)}</a>`)
    }
  }

  return (
    <div className={cn("flex flex-col rounded-xl border border-input bg-background", className)}>
      {/* Toolbar */}
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-border p-1.5">
        <ToolbarButton label="Bold" onClick={() => exec("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
        <Sep />
        <ToolbarButton label="Heading" onClick={wrapHeading}><Heading2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Paragraph" onClick={wrapParagraph}><Type className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Quote" onClick={wrapBlockquote}><Quote className="h-4 w-4" /></ToolbarButton>
        <Sep />
        <ToolbarButton label="Bulleted list" onClick={() => exec("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
        <Sep />
        <ToolbarButton label="Link" onClick={insertLink}><Link2 className="h-4 w-4" /></ToolbarButton>
        <Sep />
        <ToolbarButton label="Undo" onClick={() => exec("undo")}><Undo2 className="h-4 w-4" /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => exec("redo")}><Redo2 className="h-4 w-4" /></ToolbarButton>
      </div>

      {/* Editor surface */}
      <div
        ref={ref}
        id={id}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLElement).innerHTML)}
        onPaste={(e) => {
          // Strip rich formatting from pasted content — preserve
          // plain text + line breaks. Prevents external styles from
          // bleeding into the email body.
          e.preventDefault()
          const text = e.clipboardData.getData("text/plain")
          document.execCommand("insertText", false, text)
        }}
        role="textbox"
        aria-multiline="true"
        aria-label={rest["aria-label"]}
        style={{ minHeight }}
        className={cn(
          "rich-text-editor flex-1 overflow-y-auto p-3 text-sm leading-relaxed outline-none",
          // :empty + data-placeholder gives us a CSS-only placeholder.
          "[&:empty]:before:pointer-events-none [&:empty]:before:select-none",
          "[&:empty]:before:text-muted-foreground/70",
          "[&:empty]:before:content-[attr(data-placeholder)]",
          // Light prose styling inside the editor.
          "[&_a]:font-medium [&_a]:text-brand [&_a]:underline dark:[&_a]:text-primary",
          "[&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-bold",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:list-decimal [&_ol]:pl-5",
          "[&_p]:mt-1.5 first:[&_p]:mt-0",
        )}
      />
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent the editor losing focus before exec runs.
        e.preventDefault()
        onClick()
      }}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
}
function escapeAttr(s: string) {
  return s.replace(/[&"<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)
}
