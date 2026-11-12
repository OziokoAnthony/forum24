import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const columns = [
  {
    title: 'Sections',
    links: [
      { label: 'Nigeria News', to: '/category/news' },
      { label: 'Africa News', to: '/category/africa' },
      { label: 'Business', to: '/category/business' },
      { label: 'Tech & AI', to: '/category/tech' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Videos', to: '/resources?tab=videos' },
      { label: 'Documents', to: '/resources?tab=documents' },
      { label: 'Newsletter', to: '/#newsletter' },
      { label: 'About', to: '/about' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms & conditions', to: '/terms' },
      { label: 'Editorial policy', to: '/editorial-policy' },
      { label: 'Cookie settings', to: '/privacy#cookies' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-linear-to-b from-navy-soft/70 via-navy to-navy-deep text-sky-100 shadow-[0_-24px_60px_-34px_rgb(15_36_52_/_0.75)]">
      <div aria-hidden="true" className="rule-3d-sun h-1.5 w-full" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sun-400/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo inverted />
            <p className="mt-3 max-w-[38ch] text-sm text-sky-200">
              Nigeria’s pulse. Africa’s stories. News, video and learning for the continent and
              the diaspora.
            </p>
              <p className="mt-4 text-sm text-sky-200">
              <a href="mailto:hello@forum24.example" className="underline hover:text-sun-200">
                hello@forum24.example
              </a>
              <br />
              Lagos, Nigeria
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-[12px] font-bold tracking-[0.08em] text-sun-300 uppercase">
                {column.title}
              </h2>
              <ul className="grid gap-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-sky-100 hover:text-sun-200 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-sky-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 FORUM24. All rights reserved.</p>
          <p>
            Advertisements are labelled and never block content. Publisher identity and contact
            details are available on the About page.
          </p>
        </div>
      </div>
    </footer>
  )
}
