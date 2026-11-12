/**
 * Animated background wash.
 *
 * Three oversized radial gradients drift around the viewport on long, offset
 * cycles so the page feels alive without ever pulling focus from the content.
 * The blobs are plain elements animated with `transform` only, so the browser
 * keeps them on the GPU and never repaints the gradients.
 *
 * `placement="fixed"` layers behind the whole page; `placement="studio"` sits
 * inside the dark hero, where it is screen-blended into a glow.
 */
export function Aurora({
  placement = 'fixed',
  quiet = false,
}: {
  placement?: 'fixed' | 'studio'
  quiet?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className={`aurora aurora--${placement}${quiet ? ' aurora--quiet' : ''}`}
    >
      <span className="aurora-blob aurora-blob--1" />
      <span className="aurora-blob aurora-blob--2" />
      <span className="aurora-blob aurora-blob--3" />
    </div>
  )
}
