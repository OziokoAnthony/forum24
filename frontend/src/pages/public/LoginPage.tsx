import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/layout/Logo'
import { ApiError, apiEnabled, login } from '../../lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(apiEnabled ? 'admin@forum24.example' : 'editor@forum24.example')
  const [password, setPassword] = useState(apiEnabled ? 'Forum24!demo' : 'demo-password')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Without an API the demo keeps its original walk-through behaviour.
    if (!apiEnabled) {
      navigate('/admin')
      return
    }

    setBusy(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.detail
          : 'Sign-in failed. Check your connection and try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fade-up mx-auto mt-8 grid max-w-[980px] overflow-hidden rounded-card border border-line bg-panel shadow-card lg:grid-cols-2">
      <div
        className="hidden flex-col justify-between p-8 text-sky-900 lg:flex"
        style={{
          background:
            'radial-gradient(60% 60% at 20% 20%, #ffffff 0%, transparent 70%), radial-gradient(55% 55% at 88% 2%, #fff3b8 0%, transparent 62%), linear-gradient(160deg, #f7fcff 0%, #e0f2fe 55%, #bae6fd 100%)',
        }}
      >
        <Logo />
        <div>
          <h1 className="max-w-[18ch] text-[32px] leading-[1.1] font-extrabold">
            The editorial desk for Nigeria’s next publication.
          </h1>
          <p className="mt-3 max-w-[38ch] text-sm text-ink-soft">
            Review drafts, check sources and approve stories. AI assists; a human always
            publishes.
          </p>
        </div>
        <p className="text-xs text-ink-muted">
          Access is role-based. Every sensitive action is written to the audit log.
        </p>
      </div>

      <div className="p-6 sm:p-10">
        <p className="text-[12px] font-bold tracking-[0.08em] text-sky-700 uppercase">
          Editorial sign in
        </p>
        <h2 className="mt-1 text-[26px] font-extrabold">Welcome back</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {apiEnabled
            ? 'Sign in with your editorial account to review, schedule and publish.'
            : 'This is a demo form. Any values will take you to the dashboard.'}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="text-sm font-bold text-ink">
              Email address
            </label>
            <div className="mt-1 flex min-h-11 items-center gap-2 rounded-control border border-line bg-panel px-3 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/25">
              <Mail size={16} aria-hidden="true" className="text-ink-muted" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-[15px] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="text-sm font-bold text-ink">
              Password
            </label>
            <div className="mt-1 flex min-h-11 items-center gap-2 rounded-control border border-line bg-panel px-3 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/25">
              <Lock size={16} aria-hidden="true" className="text-ink-muted" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-[15px] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in to the editorial desk'}
          </Button>
        </form>

        {apiEnabled && (
          <p className="mt-4 rounded-control bg-cloud p-3 text-xs text-ink-muted">
            Demo account: <span className="font-semibold text-ink">admin@forum24.example</span> /{' '}
            <span className="font-semibold text-ink">Forum24!demo</span>
          </p>
        )}

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link to="/" className="font-semibold text-sky-700 hover:underline">
            ← Back to the public site
          </Link>
          <span className="text-ink-muted">Forgot password?</span>
        </div>

        <p className="mt-6 rounded-control bg-cloud p-3 text-xs text-ink-muted">
          Readers do not need an account to read, watch or download. Sign-in is for editorial
          and administrative roles only.
        </p>
      </div>
    </div>
  )
}
