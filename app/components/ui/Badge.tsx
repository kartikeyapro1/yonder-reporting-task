interface BadgeProps {
  label: string
  variant?: 'active' | 'inactive' | 'neutral' | 'new' | 'boost'
}

const variants = {
  active:   'bg-accent-green/10 text-accent-green border border-accent-green/20',
  inactive: 'bg-ink-tertiary/10 text-ink-tertiary border border-ink-tertiary/20',
  neutral:  'bg-surface-muted text-ink-secondary border border-surface-border',
  new:      'bg-brand-100 text-brand-700 border border-brand-200',
  boost:    'bg-accent-amber/15 text-accent-amber border border-accent-amber/30',
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {label}
    </span>
  )
}
