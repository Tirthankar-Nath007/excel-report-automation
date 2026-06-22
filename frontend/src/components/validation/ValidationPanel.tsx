import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { useValidation } from '../../hooks/useValidation'
import type { FileMetadata, ValidationResult } from '../../types'
import { formatDate } from '../../utils/portfolioDetection'

const schema = z.object({
  mode: z.enum(['week', 'month', 'custom']),
  customDays: z.coerce.number().min(1).max(365).optional(),
})

type FormValues = {
  mode: 'week' | 'month' | 'custom'
  customDays?: number
}

interface ValidationPanelProps {
  filesMetadata: FileMetadata[]
  disabled?: boolean
}

export function ValidationPanel({ filesMetadata, disabled }: ValidationPanelProps) {
  const [expandedPortfolio, setExpandedPortfolio] = useState<string | null>(null)
  const mutation = useValidation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { mode: 'week' },
  })

  const mode = watch('mode')

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      filesMetadata,
      mode: values.mode,
      customDays: values.customDays,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Date Coverage Validation</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Validation Mode</label>
          <select
            {...register('mode')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="week">One Week (7 days)</option>
            <option value="month">One Month (30 days)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {mode === 'custom' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Number of Days</label>
            <input
              type="number"
              min={1}
              max={365}
              {...register('customDays')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="30"
            />
            {errors.customDays && (
              <p className="text-xs text-red-500 mt-1">{errors.customDays.message}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="secondary"
          loading={mutation.isPending}
          disabled={disabled || filesMetadata.length === 0}
        >
          Validate
        </Button>
      </form>

      {mutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Spinner size="sm" /> Checking date coverage…
        </div>
      )}

      {mutation.data && (
        <div className="space-y-2">
          {mutation.data.results.map((r) => (
            <ValidationResultRow
              key={r.portfolio}
              result={r}
              expanded={expandedPortfolio === r.portfolio}
              onToggle={() =>
                setExpandedPortfolio(
                  expandedPortfolio === r.portfolio ? null : r.portfolio,
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ValidationResultRow({
  result,
  expanded,
  onToggle,
}: {
  result: ValidationResult
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
          result.is_complete
            ? 'bg-green-50 text-green-800 hover:bg-green-100'
            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
        }`}
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          <span>{result.is_complete ? '✓' : '⚠'}</span>
          <span className="capitalize">{result.portfolio}</span>
          <span className="font-normal text-xs opacity-75">
            {result.is_complete
              ? 'All dates present'
              : `Missing ${result.missing_dates.length} date(s)`}
          </span>
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-white border-t text-sm space-y-2">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium text-gray-700 block">Start Date</span>
              {formatDate(result.start_date)}
            </div>
            <div>
              <span className="font-medium text-gray-700 block">Available</span>
              {result.available_dates.length} days
            </div>
            <div>
              <span className="font-medium text-gray-700 block">Expected</span>
              {result.expected_dates.length} days
            </div>
          </div>
          {result.missing_dates.length > 0 && (
            <Alert type="warning" title="Missing Dates">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {result.missing_dates.map((d) => (
                  <span
                    key={d}
                    className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-mono"
                  >
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
