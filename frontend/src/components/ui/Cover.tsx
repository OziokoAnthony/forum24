import type { ReactNode } from 'react'

type Palette = {
  base: string
  accent: string
  deep: string
}

const palettes: Palette[] = [
  { base: '#0f2434', accent: '#2b85e2', deep: '#08151e' },
  { base: '#1457ad', accent: '#a8ecff', deep: '#0f2434' },
  { base: '#111c26', accent: '#e4ce65', deep: '#123a6b' },
  { base: '#1a6fd8', accent: '#fdfaee', deep: '#124688' },
  { base: '#124688', accent: '#4ed6ff', deep: '#0f2434' },
  { base: '#0f2434', accent: '#f4e59a', deep: '#1457ad' },
]

/**
 * Decorative editorial plate used until real media is uploaded.
 * Deterministic navy/azure geometry with occasional mustard accents — no pale
 * gradients, no stock-photo pastiche.
 */
export function Cover({
  tone = 0,
  className = '',
  children,
}: {
  tone?: number
  className?: string
  children?: ReactNode
}) {
  const index = Math.abs(tone) % palettes.length
  const { base, accent, deep } = palettes[index]

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: base }}
      aria-hidden={children ? undefined : 'true'}
    >
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        focusable="false"
        aria-hidden="true"
      >
        <rect width="400" height="250" fill={base} />
        <path d="M0 250 L400 118 L400 250 Z" fill={deep} opacity="0.75" />

        {index === 0 && (
          <>
            <circle cx="316" cy="72" r="86" fill={accent} opacity="0.92" />
            <circle cx="316" cy="72" r="112" fill="none" stroke={accent} strokeWidth="1" opacity="0.45" />
            <path d="M0 176 L400 44" stroke={accent} strokeWidth="1" opacity="0.35" />
            <rect x="26" y="26" width="34" height="34" fill="none" stroke={accent} strokeWidth="2" />
          </>
        )}

        {index === 1 && (
          <>
            <rect x="238" y="0" width="58" height="250" fill={deep} opacity="0.55" />
            <rect x="312" y="0" width="16" height="250" fill={accent} opacity="0.7" />
            <circle cx="118" cy="128" r="74" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />
            <circle cx="118" cy="128" r="42" fill={accent} opacity="0.25" />
            <path d="M0 40 L400 40" stroke={accent} strokeWidth="1" opacity="0.3" />
          </>
        )}

        {index === 2 && (
          <>
            <g stroke={accent} strokeWidth="1" opacity="0.3">
              <path d="M-40 210 L210 -40" />
              <path d="M20 250 L270 0" />
              <path d="M80 290 L330 40" />
              <path d="M140 330 L390 80" />
            </g>
            <rect x="252" y="42" width="98" height="98" fill="none" stroke={accent} strokeWidth="2" opacity="0.9" />
            <rect x="280" y="70" width="42" height="42" fill={accent} opacity="0.9" />
          </>
        )}

        {index === 3 && (
          <>
            <circle cx="92" cy="126" r="118" fill="none" stroke={accent} strokeWidth="2" opacity="0.55" />
            <circle cx="92" cy="126" r="76" fill="none" stroke={accent} strokeWidth="1" opacity="0.4" />
            <rect x="250" y="0" width="150" height="250" fill={deep} opacity="0.6" />
            <rect x="274" y="42" width="102" height="102" fill={accent} opacity="0.85" />
          </>
        )}

        {index === 4 && (
          <>
            <path d="M400 250 L400 20 A230 230 0 0 0 170 250 Z" fill={deep} opacity="0.6" />
            <circle cx="96" cy="62" r="30" fill={accent} opacity="0.9" />
            <rect x="48" y="160" width="16" height="16" fill={accent} opacity="0.9" />
            <rect x="76" y="160" width="16" height="16" fill={accent} opacity="0.55" />
            <rect x="104" y="160" width="16" height="16" fill={accent} opacity="0.3" />
          </>
        )}

        {index === 5 && (
          <>
            <g fill="none" stroke={accent} opacity="0.5">
              <circle cx="200" cy="125" r="34" strokeWidth="2" />
              <circle cx="200" cy="125" r="68" strokeWidth="1.5" />
              <circle cx="200" cy="125" r="102" strokeWidth="1" />
              <circle cx="200" cy="125" r="136" strokeWidth="1" />
            </g>
            <circle cx="200" cy="125" r="10" fill={accent} />
            <rect x="26" y="200" width="54" height="6" fill={accent} opacity="0.9" />
          </>
        )}

        <rect
          x="14"
          y="14"
          width="372"
          height="222"
          fill="none"
          stroke={accent}
          strokeWidth="1"
          opacity="0.28"
        />
      </svg>
      {children}
    </div>
  )
}
