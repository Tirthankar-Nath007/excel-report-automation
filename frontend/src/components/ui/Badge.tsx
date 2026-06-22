interface BadgeProps {
  children: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple'
}

const colors = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
}

const PORTFOLIO_COLORS: Record<string, BadgeProps['color']> = {
  commercial: 'blue',
  usedcars: 'purple',
  tw: 'green',
  personalloans: 'amber',
}

export function Badge({ children, color }: BadgeProps) {
  const resolvedColor =
    color ?? PORTFOLIO_COLORS[children.toLowerCase()] ?? 'gray'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[resolvedColor]}`}
    >
      {children}
    </span>
  )
}
