import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { Logo } from './Logo'
import { buttonClass } from '../ui/Button'

const navItems = [
  { label: 'News', to: '/category/news' },
  { label: 'Africa', to: '/category/africa' },
  { label: 'Business', to: '/category/business' },
  { label: 'Tech & AI', to: '/category/tech' },
  { label: 'Education', to: '/category/education' },
  { label: 'Sports', to: '/category/sports' },
  { label: 'Videos', to: '/resources?tab=videos' },
  { label: 'Resources', to: '/resources' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-panel shadow-header">
      <div aria-hidden="true" className="rule-3d h-1.5 w-full" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-sky-600 focus:px-4 focus:py-2 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `relative rounded-full px-2.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-sky-800 after:absolute after:inset-x-2.5 after:-bottom-[3px] after:h-[3px] after:rounded-full after:bg-sun-400 after:shadow-[0_1px_0_#b8951f,0_2px_6px_-2px_rgb(180_120_0_/_0.75)]'
                    : 'text-ink-soft hover:bg-sky-100/70 hover:text-sky-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} role="search" className="ml-auto hidden md:block">
          <label htmlFor="site-search" className="sr-only">
            Search stories, videos and documents
          </label>
          <div className="flex min-h-11 min-w-[230px] items-center gap-2 rounded-control border border-line bg-white/70 px-3.5 text-sm text-ink-muted shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.08),inset_0_-1px_0_rgb(255_255_255_/_0.9)] focus-within:border-sky-400 focus-within:shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.06),0_0_0_3px_rgb(56_189_248_/_0.25)]">
            <Search size={16} aria-hidden="true" />
            <input
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories, videos, documents…"
              className="w-full border-0 bg-transparent p-0 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </form>

        <Link to="/login" className={`${buttonClass('primary')} hidden sm:inline-flex`}>
          Subscribe
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-control border border-line bg-white/70 text-ink-soft shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_2px_0_rgb(11_53_88_/_0.08)] hover:bg-sky-100/70 hover:text-sky-700 active:translate-y-[2px] active:shadow-none xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-panel xl:hidden">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
            <form onSubmit={submitSearch} role="search" className="mb-3 md:hidden">
              <label htmlFor="mobile-search" className="sr-only">
                Search
              </label>
              <div className="flex min-h-11 items-center gap-2 rounded-control border border-line bg-white/70 px-3 shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.08)] focus-within:border-sky-400 focus-within:shadow-[inset_0_2px_5px_rgb(11_53_88_/_0.06),0_0_0_3px_rgb(56_189_248_/_0.25)]">
                <Search size={16} aria-hidden="true" className="text-ink-muted" />
                <input
                  id="mobile-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search FORUM24"
                  className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none"
                />
              </div>
            </form>
            <nav aria-label="Mobile" className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-control px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-sky-100/70 hover:text-sky-700"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-2">
                <Link to="/login" className={`${buttonClass('primary')} flex-1`}>
                  Subscribe
                </Link>
                <Link to="/admin" className={`${buttonClass('secondary')} flex-1`}>
                  Editorial desk
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
