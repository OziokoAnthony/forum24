/**
 * Editorial session storage.
 *
 * Kept deliberately free of any API imports so the network layer can depend on
 * it without creating a cycle. The token lives in localStorage so a refresh
 * keeps the editor signed in; role checks still happen on the server.
 */

export type SessionUser = {
  id: number
  name: string
  email: string
  slug: string
  role: string
  title?: string | null
}

export type Session = {
  token: string
  expiresAt: number
  user: SessionUser
}

const STORAGE_KEY = 'forum24.session'

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readSession(): Session | null {
  const store = storage()
  if (!store) return null

  const raw = store.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Session).token !== 'string' ||
      typeof (parsed as Session).expiresAt !== 'number' ||
      typeof (parsed as Session).user !== 'object'
    ) {
      return null
    }
    const session = parsed as Session
    if (session.expiresAt <= Date.now()) {
      store.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    store.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Private browsing or a full quota: the session still works in memory for
    // this page, it just will not survive a refresh.
  }
}

export function clearSession(): void {
  try {
    storage()?.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do if storage is unavailable.
  }
}

export function sessionToken(): string | null {
  return readSession()?.token ?? null
}

export function currentUser(): SessionUser | null {
  return readSession()?.user ?? null
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return `${first}${last}`.toUpperCase() || '??'
}
