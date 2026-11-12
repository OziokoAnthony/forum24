import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 min-h-11 rounded-control px-4 text-[14px] font-bold tracking-[0.01em] transition-[background-color,border-color,color,filter] duration-150 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Primary: an extruded key that presses down on click.
  primary: 'btn-3d',
  // Secondary: pressed-in glass, still clearly one step below primary.
  secondary: 'btn-glass',
  ghost: 'text-ink-soft hover:bg-sky-100/70 hover:text-sky-800 active:translate-y-px',
  danger:
    'bg-red-700 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.25),0_3px_0_#7f1d1d,0_12px_20px_-14px_rgb(185_28_28_/_0.9)] hover:bg-red-600 active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.2),0_0_0_#7f1d1d]',
}

export function buttonClass(variant: Variant = 'primary') {
  return `${base} ${variants[variant]}`
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button className={`${buttonClass(variant)} ${className}`} {...rest}>
      {children}
    </button>
  )
}
