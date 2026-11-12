import { useState, type FormEvent } from 'react'
import { Check, Mail } from 'lucide-react'
import { Button } from '../ui/Button'
import { ApiError, apiEnabled } from '../../lib/api'
import { subscribeNewsletter } from '../../lib/adminApi'

export function NewsletterCard() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState('You’re on the list. Check your inbox to confirm.')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!email.trim()) return

    if (!apiEnabled) {
      setDone(true)
      return
    }

    setBusy(true)
    try {
      const result = await subscribeNewsletter(email.trim())
      setStatus(
        result.status === 'already-subscribed'
          ? 'You’re already on the list — nothing else to do.'
          : result.status === 'resubscribed'
            ? 'Welcome back. Your subscription is active again.'
            : 'You’re on the list. Check your inbox to confirm.',
      )
      setDone(true)
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.detail : 'Could not subscribe. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      id="newsletter"
      className="slab relative overflow-hidden rounded-card p-6 sm:p-8"
      aria-labelledby="newsletter-title"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-sun-300/30 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-control bg-linear-to-b from-sun-200 to-sun-100 text-sun-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.85),0_2px_0_#b8951f,0_10px_18px_-12px_rgb(180_120_0_/_0.85)] sm:grid">
          <Mail size={22} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="newsletter-title" className="text-xl font-extrabold">
            The FORUM24 morning brief
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            The stories that matter in Nigeria and Africa, in your inbox before 8am. Free, and
            you can unsubscribe in one click.
          </p>

          {done ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-control bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
              <Check size={16} aria-hidden="true" />
              {status}
            </p>
          ) : (
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-11 flex-1 rounded-control border border-line bg-panel px-3 text-[15px] focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none"              />
              <Button type="submit" disabled={busy}>
                {busy ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <p className="mt-2 text-xs text-ink-muted">
            By subscribing you agree to our privacy policy. We never sell your address.
          </p>
        </div>
      </div>
    </section>
  )
}
