interface InsightCardProps {
  text: string
  index?: number
}

export function InsightCard({ text }: InsightCardProps) {
  return (
    <div className="flex gap-3 items-start rounded-lg bg-gray-50 border border-gray-200 px-4 py-3.5">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-coral shrink-0" />
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  )
}
