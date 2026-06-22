import { Badge } from '../ui/Badge'
import type { FileWithMeta } from '../../types'
import { formatDate } from '../../utils/portfolioDetection'

const KNOWN_PORTFOLIOS = ['commercial', 'usedcars', 'tw', 'personalloans']

interface FileListItemProps {
  item: FileWithMeta
  onOverrideChange: (id: string, value: string | null) => void
  onRemove: (id: string) => void
}

export function FileListItem({
  item,
  onOverrideChange,
  onRemove,
}: FileListItemProps) {
  const effectivePortfolio = item.portfolioOverride ?? item.portfolio

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* File icon */}
      <svg
        className="h-5 w-5 text-green-600 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>

      {/* Filename */}
      <span
        className="flex-1 text-sm text-gray-700 truncate"
        title={item.file.name}
      >
        {item.file.name}
      </span>

      {/* Date range */}
      {item.fromDate && (
        <span className="text-xs text-gray-500 shrink-0">
          {formatDate(item.fromDate)}
          {item.toDate !== item.fromDate && ` – ${formatDate(item.toDate)}`}
        </span>
      )}

      {/* Portfolio badge + override */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge>{effectivePortfolio}</Badge>
        <select
          className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          value={item.portfolioOverride ?? ''}
          onChange={(e) =>
            onOverrideChange(item.id, e.target.value || null)
          }
        >
          <option value="">Auto-detected</option>
          {KNOWN_PORTFOLIOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {item.error && (
        <span className="text-xs text-red-500 shrink-0" title={item.error}>
          ⚠
        </span>
      )}

      {/* Remove */}
      <button
        className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => onRemove(item.id)}
        title="Remove file"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
