import type { ReactNode } from 'react'

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title?: string
  children: ReactNode
}

const styles = {
  info: {
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: '💡',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: '⚠️',
  },
  error: {
    wrapper: 'bg-red-50 border-red-200 text-red-800',
    icon: '✗',
  },
  success: {
    wrapper: 'bg-green-50 border-green-200 text-green-800',
    icon: '✓',
  },
}

export function Alert({ type, title, children }: AlertProps) {
  const s = styles[type]
  return (
    <div className={`rounded-lg border p-4 ${s.wrapper}`}>
      <div className="flex gap-2">
        <span className="text-base">{s.icon}</span>
        <div className="text-sm">
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
