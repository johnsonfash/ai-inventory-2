// Common API types. Kept deliberately thin — once the real backend
// lands, swap these for generated types from an OpenAPI spec.

// Wrapper for cursor-paginated endpoints. Mirrors what most modern
// REST + GraphQL connection patterns return.
export type Paginated<T> = {
  items: T[]
  /** Opaque cursor for the next page; null when there are no more. */
  nextCursor: string | null
  /** Total count when the server can produce it cheaply; absent
   *  otherwise. UI should fall back to "Showing N of many" when
   *  this is missing. */
  total?: number
}

// Structured error returned from `api.request`. The client throws
// these for any non-2xx response (or a network failure); callers
// can `catch` + match on `status` / `code` to decide whether to
// re-prompt, log out, or surface a generic toast.
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly details?: unknown

  constructor(message: string, opts: { status: number; code?: string | null; details?: unknown }) {
    super(message)
    this.name = "ApiError"
    this.status = opts.status
    this.code = opts.code ?? null
    this.details = opts.details
  }

  /** True iff the failure is something the user can fix by trying
   *  again later — network drop, 5xx, or 429. Useful for retry
   *  decisions in React Query. */
  get isTransient(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500
  }
}
