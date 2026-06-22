import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { useMergeReports } from '../hooks/useMergeReports'
import { formatDate } from '../utils/portfolioDetection'

interface ParsedReport {
  file: File
  portfolios: string[]
  fromDate: string
  toDate: string
}

function parseReportFilename(
  filename: string,
): { portfolios: string[]; fromDate: string; toDate: string } | null {
  // report_{portfolios}_{DD-MM-YYYY}_to_{DD-MM-YYYY}.xlsx
  const m = filename.match(
    /^report_(.+?)_(\d{2}-\d{2}-\d{4})_to_(\d{2}-\d{2}-\d{4})\.xlsx$/i,
  )
  if (!m) return null
  const portfolioPart = m[1]
  const portfolios = portfolioPart.split('_').filter(Boolean)
  const [d1, mo1, y1] = m[2].split('-')
  const [d2, mo2, y2] = m[3].split('-')
  return {
    portfolios,
    fromDate: `${y1}-${mo1}-${d1}`,
    toDate: `${y2}-${mo2}-${d2}`,
  }
}

export function MergeReports() {
  const [reports, setReports] = useState<ParsedReport[]>([])
  const mutation = useMergeReports()

  const onDrop = useCallback(
    (accepted: File[]) => {
      const parsed: ParsedReport[] = []
      const invalid: string[] = []

      accepted.forEach((f) => {
        const result = parseReportFilename(f.name)
        if (!result) {
          invalid.push(f.name)
          return
        }
        parsed.push({ file: f, ...result })
      })

      if (invalid.length > 0) {
        toast.error(
          `${invalid.length} file(s) don't match the expected naming convention`,
        )
      }
      setReports((prev) => {
        const existing = new Set(prev.map((r) => r.file.name))
        return [...prev, ...parsed.filter((p) => !existing.has(p.file.name))]
      })
    },
    [],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    multiple: true,
  })

  // Validate that all uploaded reports share the same date range
  const dateRanges = [
    ...new Set(reports.map((r) => `${r.fromDate}|${r.toDate}`)),
  ]
  const datesMismatch = dateRanges.length > 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Merge Existing Portfolio Reports
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload previously generated portfolio report files to merge them into
          a single side-by-side Excel. Date ranges must match.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop report files here' : 'Drop report_*.xlsx files or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          e.g. report_commercial_01-06-2026_to_07-06-2026.xlsx
        </p>
      </div>

      {reports.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {reports.length} report{reports.length !== 1 ? 's' : ''} selected
            </p>
            <button
              className="text-xs text-red-500 hover:text-red-700"
              onClick={() => setReports([])}
            >
              Clear all
            </button>
          </div>

          {reports.map((r) => (
            <div
              key={r.file.name}
              className="flex items-center gap-3 py-2.5 px-3 bg-white rounded-lg border border-gray-200"
            >
              <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="flex-1 text-sm text-gray-700 truncate">{r.file.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {r.portfolios.map((p) => <Badge key={p}>{p}</Badge>)}
              </div>
              <span className="text-xs text-gray-500 shrink-0">
                {formatDate(r.fromDate)} – {formatDate(r.toDate)}
              </span>
              <button
                className="shrink-0 text-gray-400 hover:text-red-500"
                onClick={() =>
                  setReports((prev) => prev.filter((x) => x.file.name !== r.file.name))
                }
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {datesMismatch && (
            <Alert type="warning" title="Date Range Mismatch">
              The selected reports have different date ranges. Merging will
              fail. Please upload reports for the same period.
            </Alert>
          )}

          {mutation.isError && (
            <Alert type="error" title="Merge Failed">
              {(mutation.error as Error).message}
            </Alert>
          )}

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              loading={mutation.isPending}
              disabled={reports.length < 2 || datesMismatch}
              onClick={() => mutation.mutate(reports.map((r) => r.file))}
            >
              Merge Reports
            </Button>
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <Alert type="info">
          Upload two or more previously generated report files. Each file must
          follow the naming convention:{' '}
          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
            report_&#123;portfolio&#125;_DD-MM-YYYY_to_DD-MM-YYYY.xlsx
          </code>
        </Alert>
      )}
    </div>
  )
}
