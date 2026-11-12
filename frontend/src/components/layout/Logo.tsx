import { Link } from 'react-router-dom'

/**
 * The supplied FORUM24 lockup, used as a single image so the lettering stays
 * exactly as drawn. The inverse file is white for dark surfaces (the footer).
 * Both PNGs are trimmed and transparent; `public/forum24.jpg` is the source.
 */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="FORUM24 home">
      <img
        src={inverted ? '/forum24-logo-inverse.png' : '/forum24-logo.png'}
        alt=""
        width={803}
        height={274}
        className="h-10 w-auto"
        decoding="async"
        draggable={false}
      />
    </Link>
  )
}
