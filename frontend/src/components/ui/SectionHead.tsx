import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function SectionHead({
  title,
  action,
  to,
  description,
  children,
}: {
  title: string
  action?: string
  to?: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="relative mt-12 mb-5 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
      <span
        aria-hidden="true"
        className="absolute -top-[3px] left-0 h-[6px] w-16 rounded-full bg-linear-to-r from-sun-300 to-sun-400 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.8),0_1px_0_#b8951f,0_6px_12px_-8px_rgb(180_120_0_/_0.85)]"
      />
      <div className="min-w-0">
        <h2 className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em] text-navy sm:text-[30px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[64ch] text-[13.5px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      {action && to && (
        <Link
          to={to}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[10.5px] font-extrabold tracking-[0.12em] text-sky-700 uppercase hover:text-sky-900"        >
          {action}
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
      {children}
    </div>
  )
}
