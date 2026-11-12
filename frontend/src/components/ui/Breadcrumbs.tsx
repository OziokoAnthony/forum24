import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export type Crumb = { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] font-medium text-ink-muted">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 && <ChevronRight size={13} aria-hidden="true" className="text-ink-faint" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-sky-700 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="line-clamp-1 text-ink-soft">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
