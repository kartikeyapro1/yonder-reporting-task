interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-card ${onClick ? 'cursor-pointer hover:shadow-card-hover transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
