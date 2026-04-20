interface BadgeProps {
  label: string
  variant?: 'active' | 'inactive' | 'neutral' | 'new' | 'boost'
  pulse?: boolean
}

const variants = {
  active:   'bg-accent-green/10 text-accent-emerald border border-accent-green/20',
  inactive: 'bg-surface-muted text-ink-tertiary border border-surface-border',
  neutral:  'bg-surface-muted text-ink-secondary border border-surface-border',
  new:      'bg-coral-subtle text-coral border border-coral/20',
  boost:    'bg-accent-amber/10 text-accent-amber border border-accent-amber/20',
}

export function Badge({ label, variant = 'neutral', pulse }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${variants[variant]}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'active' ? 'bg-accent-green' : 'bg-coral'
          }`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            variant === 'active' ? 'bg-accent-green' : 'bg-coral'
          }`} />
        </span>
      )}
      {label}
    </span>
  )
}
