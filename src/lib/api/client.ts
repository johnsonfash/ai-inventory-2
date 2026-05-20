import { toast } from "sonner"
import { ApiError } from "./types"
import { clearAuth, getAccessToken } from "./auth-token"

// Pallio API client. Thin fetch wrapper — no axios dep, no class
// hierarchy, no plugin system. The whole job:
//
//   * Prefix every URL with VITE_API_BASE_URL (written by ip.js).
//   * Auth header injection from the in-memory access token.
//   * JSON in / JSON out. Strongly typed via the request <T> generic.
//   * Normalised error path — every non-2xx throws an ApiError that
//     consumers (and React Query) can pattern-match on.
//   * 401 handling — clearAuth() once, no retry. The refresh-token
//     dance lives in a higher layer (we don't have a refresh
//     endpoint to wire yet).
//   * 5xx + network failures get a one-time toast so the user
//     sees something even if the caller swallows the throw.
//
// Use directly:
//
//   const items = await api.get<Item[]>('/items', { params: { page: 2 } })
//   await api.post('/orders', { items: [...] })
//
// Or via React Query for the cache + retry / refetch story:
//
//   useQuery({
//     queryKey: ['items', page],
//     queryFn: () => api.get<Paginated<Item>>('/items', { params: { page } }),
//   })

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? ""
// Trim trailing slash so we can always join with a leading-slash path.
const BASE = RAW_BASE.replace(/\/+$/, "")

type Params = Record<string, string | number | boolean | null | undefined>

type RequestOptions = {
  /** Query string. Null / undefined values are dropped. */
  params?: Params
  /** Extra headers — merged on top of defaults. */
  headers?: Record<string, string>
  /** AbortSignal for cancellation. Pair with React Query's signal
   *  to cancel in-flight requests when the component unmounts. */
  signal?: AbortSignal
  /** Override the global VITE_API_BASE_URL for one call (e.g. AI
   *  endpoints on a different host). */
  baseUrl?: string
}

type WriteOptions = RequestOptions & {
  /** Body — auto-JSON.stringify'd unless it's already a string or
   *  FormData. */
  body?: unknown
}

function buildQuery(params?: Params): string {
  if (!params) return ""
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue
    usp.set(k, String(v))
  }
  const s = usp.toString()
  return s ? `?${s}` : ""
}

async function request<T>(method: string, path: string, opts: WriteOptions = {}): Promise<T> {
  const base = opts.baseUrl !== undefined ? opts.baseUrl.replace(/\/+$/, "") : BASE
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}${buildQuery(opts.params)}`

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...opts.headers,
  }

  const token = getAccessToken()
  if (token) headers["Authorization"] = `Bearer ${token}`

  let body: BodyInit | undefined
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body
      // Don't set Content-Type — the browser writes the multipart
      // boundary for us.
    } else if (typeof opts.body === "string") {
      body = opts.body
      headers["Content-Type"] ??= "text/plain"
    } else {
      body = JSON.stringify(opts.body)
      headers["Content-Type"] = "application/json"
    }
  }

  let res: Response
  try {
    res = await fetch(url, { method, headers, body, signal: opts.signal })
  } catch (err) {
    // Network failure / DNS / CORS preflight / AbortError. Distinguish
    // abort (caller's choice) from genuine network failure (toast).
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request cancelled", { status: 0, code: "abort" })
    }
    toast.error("Network unreachable")
    throw new ApiError("Network unreachable", { status: 0, code: "network" })
  }

  // Empty body — common for 204 No Content + DELETE responses.
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    if (res.ok) return undefined as T
    throw await toApiError(res)
  }

  // Try to parse JSON regardless of status — error responses often
  // carry useful detail in the body.
  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const payload: unknown = isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    if (res.status === 401) {
      // Single-shot logout. No refresh attempt — that's a higher
      // layer's job (and we have no refresh endpoint yet).
      void clearAuth()
    }
    if (res.status >= 500) {
      toast.error("Server error — please retry")
    }
    const message = extractMessage(payload) ?? `${method} ${path} failed (${res.status})`
    const code = extractCode(payload)
    throw new ApiError(message, { status: res.status, code, details: payload })
  }

  return payload as T
}

function extractMessage(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    if (typeof obj.message === "string") return obj.message
    if (typeof obj.error === "string") return obj.error
  }
  return null
}

function extractCode(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    if (typeof obj.code === "string") return obj.code
  }
  return null
}

async function toApiError(res: Response): Promise<ApiError> {
  const text = await res.text().catch(() => "")
  return new ApiError(text || `Request failed (${res.status})`, { status: res.status })
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, { ...opts, body }),

  /** True iff a base URL is configured. Use this to decide whether
   *  to call the real backend or fall back to a local mock. */
  isConfigured: () => BASE.length > 0,
}
