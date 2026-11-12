import type { ReactNode } from 'react'

/**
 * Editorial section label: a small sun-yellow mark plus uppercase kicker.
 * Deliberately not a pill — the rounded badges read as product UI, not as a
 * newspaper section marker. The yellow is decoration; links and buttons keep
 * sky-600 as the single action colour.
 */
export function Chip({
  children,
  tone = 'sky',
}: {
  children: ReactNode
  tone?: 'sky' | 'neutral' | 'white'
}) {
  const tones = {
    sky: 'text-sky-800',
    neutral: 'text-ink-muted',
    white: 'text-white/90',
  }
  const marks = {
    sky: 'bg-sun-400 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75),0_1px_0_#b8951f]',
    neutral: 'bg-line-strong',
    white: 'bg-sun-300 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75),0_1px_0_#b8951f]',
  }

  return (
    <span
      className={`inline-flex items-center gap-2 text-[10.5px] leading-none font-extrabold tracking-[0.16em] uppercase ${tones[tone]}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 ${marks[tone]}`} />
      {children}
    </span>
  )
}
