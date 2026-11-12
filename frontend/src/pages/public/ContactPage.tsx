import { useState, type FormEvent } from 'react'
import { Check, Mail, MapPin } from 'lucide-react'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Button } from '../../components/ui/Button'
import { ApiError, apiEnabled } from '../../lib/api'
import { sendContactMessage } from '../../lib/adminApi'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('Story tip')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('')
  const [sent, setSent] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!apiEnabled) {
      setSent(true)
      return
    }

    setBusy(true)
    try {
      const result = await sendContactMessage({ name, email, subject, message, company })
      setReference(result.reference)
      setSent(true)
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.detail : 'Could not send the message. Try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-card border border-line bg-panel p-6 shadow-card sm:p-8">
          <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">Contact</p>
          <h1 className="mt-1 text-[30px] font-extrabold sm:text-[36px]">Talk to the FORUM24 team</h1>
          <p className="mt-2 max-w-[58ch] text-[16px] text-ink-soft">
            Story tips, corrections, advertising enquiries or a problem with a download — send a
            message and the right desk will pick it up.
          </p>

          {sent ? (
            <div className="mt-6 rounded-control border border-green-200 bg-green-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-green-900">
                <Check size={16} aria-hidden="true" />
                Message sent
              </p>
              <p className="mt-1 text-sm text-green-900/80">
                Thank you. We usually reply within two working days.
              </p>
              {reference && (
                <p className="mt-2 text-sm text-green-900/80">
                  Your reference is <span className="font-bold">{reference}</span>.
                </p>
              )}
            </div>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-bold text-ink">Your name</label>
                  <input
                    id="contact-name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-control border border-line px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-bold text-ink">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-control border border-line px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-bold text-ink">Subject</label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-1 w-full rounded-control border border-line px-3 py-2 text-sm"
                >
                  <option>Story tip</option>
                  <option>Correction</option>
                  <option>Advertising</option>
                  <option>Download problem</option>
                  <option>Something else</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-bold text-ink">Message</label>
                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-1 w-full rounded-control border border-line px-3 py-2 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
                />
              </div>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>

              <label className="flex items-start gap-2 text-[13px] text-ink-soft">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-sky-600" />
                I understand that FORUM24 may keep this message to respond to my enquiry.
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full sm:w-auto" disabled={busy}>
                {busy ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </section>

        <aside className="grid content-start gap-4">
          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              <Mail size={15} aria-hidden="true" className="text-sky-600" />
              Publisher contact
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              <a href="mailto:hello@forum24.example" className="font-semibold text-sky-700 hover:underline">
                hello@forum24.example
              </a>
              <br />
              Corrections: <a href="mailto:corrections@forum24.example" className="font-semibold text-sky-700 hover:underline">corrections@forum24.example</a>
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
              <MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-sky-600" />
              FORUM24 Media, Lagos, Nigeria
            </p>
          </div>

          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Response times</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Corrections are reviewed the same working day. Advertising and partnership
              enquiries usually take two working days.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
