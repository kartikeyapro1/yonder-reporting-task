interface InsightCardProps {
  text: string
  index?: number
}

export function InsightCard({ text }: InsightCardProps) {
  return (
    <div className="border-l-2 border-coral/40 pl-4 py-0.5">
      <p className="text-sm text-ink-600 leading-relaxed">{text}</p>
    </div>
  )
}
