interface BadgeProps {
  label: string
  variant?: 'active' | 'inactive' | 'neutral' | 'new' | 'boost'
}

const variants = {
  active:   'bg-positive-light text-positive-dark border border-positive/20',
  inactive: 'bg-sand-100 text-ink-400 border border-sand-200',
  neutral:  'bg-sand-100 text-ink-500 border border-sand-200',
  new:      'bg-coral-50 text-coral-dark border border-coral-100',
  boost:    'bg-amber-50 text-amber-700 border border-amber-200',
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${variants[variant]}`}>
      {variant === 'active' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-40" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-positive" />
        </span>
      )}
      {label}
    </span>
  )
}
