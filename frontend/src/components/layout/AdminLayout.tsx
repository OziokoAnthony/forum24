import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChartNoAxesColumn,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'
import { Logo } from './Logo'
import { buttonClass } from '../ui/Button'
import { Aurora } from '../ui/Aurora'
import { apiEnabled } from '../../lib/api'
import { clearSession, currentUser, initials, type SessionUser } from '../../lib/session'

const groups = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Content',
    items: [
      { label: 'Articles', to: '/admin/articles', icon: FileText },
      { label: 'Resources', to: '/admin/resources', icon: FolderOpen },
    ],
  },
  {
    title: 'AI Desk',
    items: [{ label: 'Editorial assistant', to: '/admin/ai', icon: Sparkles }],
  },
  {
    title: 'Revenue',
    items: [
      { label: 'Advertising', to: '/admin/ads', icon: Megaphone },
      { label: 'Analytics', to: '/admin/analytics', icon: ChartNoAxesColumn },
    ],
  },
  {
    title: 'System',
    items: [{ label: 'Settings', to: '/admin/settings', icon: Settings }],
  },
]

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/articles': 'Articles',
  '/admin/articles/new': 'New article',
  '/admin/resources': 'Resources',
  '/admin/ai': 'AI editorial assistant',
  '/admin/ads': 'Advertising',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(() =>
    apiEnabled ? currentUser() : null,
  )
  const location = useLocation()
  const navigate = useNavigate()
  const title =
    titles[location.pathname] ??
    (location.pathname.startsWith('/admin/articles/') ? 'Edit article' : 'Editorial desk')

  useEffect(() => {
    if (!apiEnabled) return
    const sessionUser = currentUser()
    if (sessionUser === null) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    setUser(sessionUser)
  }, [location.pathname, navigate])

  function signOut() {
    clearSession()
    navigate('/login', { replace: true })
  }

  // The effect above redirects; render nothing for the frame before it runs.
  if (apiEnabled && user === null) return null

  return (
    <div className="min-h-screen">
      <Aurora placement="fixed" quiet />
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-line bg-panel shadow-[10px_0_36px_-28px_rgb(11_53_88_/_0.85)] transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-control text-ink-muted hover:bg-sky-50 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Editorial" className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-bold tracking-[0.08em] text-ink-faint uppercase">
                {group.title}
              </p>
              <ul className="grid gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={'end' in item ? item.end : false}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `relative flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? 'bg-sky-100 text-sky-800 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_2px_0_rgb(2_119_184_/_0.22)] after:absolute after:inset-y-1.5 after:left-0 after:w-[3px] after:rounded-full after:bg-sun-400 after:shadow-[0_1px_0_#b8951f]'
                              : 'text-ink-soft hover:bg-sky-100/60 hover:text-sky-700'
                          }`
                        }
                      >
                        <Icon size={17} aria-hidden="true" />
                        {item.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          <div className="mt-6 rounded-control border border-sun-300/60 bg-linear-to-b from-sun-50 to-sun-100/70 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_2px_0_rgb(217_148_0_/_0.35),0_12px_24px_-16px_rgb(180_120_0_/_0.8)]">
            <p className="text-xs font-bold text-ink">Human approval required</p>
            <p className="mt-1 text-xs text-ink-muted">
              AI drafts cannot publish themselves. Every article needs an editor’s approval.
            </p>
          </div>
        </nav>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
        />
      )}

      {/* Content */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-panel px-4 shadow-header">
          <div
            aria-hidden="true"
            className="rule-3d absolute inset-x-0 top-0 h-1"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-control border border-line text-ink-soft hover:bg-sky-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.06em] text-ink-faint uppercase">
              FORUM24 editorial
            </p>
            <h1 className="truncate text-[17px] font-extrabold text-ink">{title}</h1>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <div className="flex min-h-10 min-w-[210px] items-center gap-2 rounded-control border border-line bg-white/70 px-3 text-sm text-ink-muted shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.08)] focus-within:border-sky-400 focus-within:shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.06),0_0_0_3px_rgb(56_189_248_/_0.25)]">
              <Search size={15} aria-hidden="true" />
              <input
                aria-label="Search the editorial desk"
                placeholder="Search articles, resources…"
                className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-control bg-white/70 text-ink-soft shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_2px_0_rgb(11_53_88_/_0.09)] hover:bg-sky-100/70 hover:text-sky-700"
            aria-label="Notifications"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-sun-400" />
          </button>

          <Link to="/admin/articles/new" className={`${buttonClass('primary')} hidden sm:inline-flex`}>
            <Plus size={16} aria-hidden="true" />
            New article
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[12px] leading-tight font-bold text-ink">
                {user?.name ?? 'Demo editor'}
              </p>
              <p className="text-[11px] text-ink-muted capitalize">{user?.role ?? 'walkthrough'}</p>
            </div>
            <div className="disc-3d grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-extrabold text-navy-deep">
              {user ? initials(user.name) : 'AO'}
            </div>
          </div>

          {apiEnabled ? (
            <button
              type="button"
              onClick={signOut}
              className="grid h-10 w-10 place-items-center rounded-control text-ink-soft hover:bg-sky-50"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-control px-2 py-1 text-[12px] font-bold text-sky-700 hover:bg-sky-50"
            >
              Demo mode
            </Link>
          )}
        </header>

        <main className="mx-auto w-full max-w-[1200px] px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
