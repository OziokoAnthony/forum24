import {
  setContent,
  type Article,
  type Category,
  type ResourceDoc,
  type Video,
} from '../data/content'
import { clearSession, readSession, saveSession, type SessionUser } from './session'

const configuredBase = (import.meta.env.VITE_API_URL ?? '').trim()
const baseUrl = configuredBase.replace(/\/+$/, '')

/** Empty when the app should keep using its bundled demo content. */
export const apiBaseUrl = baseUrl

export const apiEnabled = baseUrl.length > 0

/** Build an absolute API URL, or a relative one when no API is configured. */
export function apiUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}/api/v1${suffix}`
}

/** A failed API call, carrying the HTTP status and the server's message. */
export class ApiError extends Error {
  readonly status: number
  readonly detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Attach the stored bearer token and sign the editor out on a 401. */
  auth?: boolean
}

function errorDetail(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (isRecord(payload)) {
    const detail = payload.detail
    if (typeof detail === 'string' && detail.trim()) return detail
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => (isRecord(item) && typeof item.msg === 'string' ? item.msg : null))
        .filter((item): item is string => item !== null)
      if (messages.length > 0) return messages.join('. ')
    }
  }
  return fallback
}

/**
 * Call an API endpoint and return the parsed JSON body.
 *
 * A network failure or non-2xx response becomes an `ApiError` so callers can
 * show a specific message instead of a generic catch-all.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!apiEnabled) {
    throw new ApiError(0, 'This build is not connected to the FORUM24 API.')
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = options.auth ? readSession()?.token : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Could not reach the FORUM24 API. Is the server running?')
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (response.status === 401 && options.auth) clearSession()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorDetail(payload, `The server returned ${response.status}.`),
    )
  }

  return payload as T
}

type LoginOut = {
  accessToken: string
  expiresIn: number
  user: SessionUser
}

/** Sign in and persist the bearer token for later admin calls. */
export async function login(email: string, password: string): Promise<SessionUser> {
  const payload = await apiRequest<LoginOut>('/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  })

  saveSession({
    token: payload.accessToken,
    expiresAt: Date.now() + payload.expiresIn * 1000,
    user: payload.user,
  })
  return payload.user
}

type BootstrapPayload = {
  categories: Category[]
  articles: Article[]
  documents: ResourceDoc[]
  videos: Video[]
}

export type HydrationSource = 'api' | 'mock'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normaliseArticle(raw: Article): Article {
  return {
    ...raw,
    tags: asArray<string>(raw.tags),
    body: asArray<Article['body'][number]>(raw.body),
    featured: Boolean(raw.featured),
    trending: Boolean(raw.trending),
  }
}

function normaliseDocument(raw: ResourceDoc): ResourceDoc {
  return {
    ...raw,
    downloadable: Boolean(raw.downloadable),
  }
}

function normaliseVideo(raw: Video): Video {
  return {
    ...raw,
    chapters: asArray<Video['chapters'][number]>(raw.chapters),
    transcript: asArray<string>(raw.transcript),
    embeddable: Boolean(raw.embeddable),
  }
}

export async function fetchBootstrap(signal?: AbortSignal): Promise<BootstrapPayload> {
  const response = await fetch(apiUrl('/bootstrap'), {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Bootstrap request failed with ${response.status}`)
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload)) {
    throw new Error('Bootstrap response was not an object')
  }
  for (const key of ['categories', 'articles', 'documents', 'videos'] as const) {
    if (!Array.isArray(payload[key])) {
      throw new Error(`Bootstrap response is missing "${key}"`)
    }
  }

  return {
    categories: asArray<Category>(payload.categories),
    articles: asArray<Article>(payload.articles).map(normaliseArticle),
    documents: asArray<ResourceDoc>(payload.documents).map(normaliseDocument),
    videos: asArray<Video>(payload.videos).map(normaliseVideo),
  }
}

/**
 * Load public content from the API when `VITE_API_URL` is set. Any failure
 * (offline API, CORS, bad payload) leaves the bundled demo content in place so
 * the site still renders.
 */
export async function hydrateContent(timeoutMs = 6000): Promise<HydrationSource> {
  if (!apiEnabled) return 'mock'

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const payload = await fetchBootstrap(controller.signal)
    setContent(payload)
    return 'api'
  } catch (error) {
    console.warn('[forum24] Could not reach the API; using bundled content.', error)
    return 'mock'
  } finally {
    window.clearTimeout(timer)
  }
}
