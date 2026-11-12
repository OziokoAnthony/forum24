type Props = {
  label?: string
  hint?: string
  minHeight?: number
  className?: string
}

/**
 * Advertising placeholder.
 * Deliberately neutral and dashed so it can never be mistaken for a
 * download button, play control or navigation. Height is reserved to
 * avoid layout shift when a real ad loads.
 */
export function AdSlot({ label = 'Advertisement', hint = 'Responsive placement', minHeight = 120, className = '' }: Props) {
  return (
    <div
      className={`ad-slot ${className}`}
      style={{ minHeight }}
      role="complementary"
      aria-label="Advertisement"
    >
      <span className="ad-label">{label}</span>
      <span className="ad-hint">{hint}</span>
    </div>
  )
}
