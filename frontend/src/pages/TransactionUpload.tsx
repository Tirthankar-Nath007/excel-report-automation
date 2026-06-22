import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/upload/FileDropZone'
import { FileListItem } from '../components/upload/FileListItem'
import { ValidationPanel } from '../components/validation/ValidationPanel'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { useProcessReports } from '../hooks/useProcessReports'
import type { FileWithMeta, FileMetadata } from '../types'
import {
  detectPortfolio,
  extractDates,
  isOnlineFile,
} from '../utils/portfolioDetection'

let idCounter = 0
function nextId() {
  return String(++idCounter)
}

export function TransactionUpload() {
  const [files, setFiles] = useState<FileWithMeta[]>([])
  const mutation = useProcessReports()

  const handleFiles = useCallback((newFiles: File[]) => {
    const rejected: string[] = []
    const valid: FileWithMeta[] = []

    newFiles.forEach((f) => {
      if (!isOnlineFile(f.name)) {
        rejected.push(f.name)
        return
      }
      const dates = extractDates(f.name)
      const portfolio = detectPortfolio(f.name)
      valid.push({
        file: f,
        id: nextId(),
        portfolio,
        portfolioOverride: null,
        fromDate: dates?.fromDate ?? '',
        toDate: dates?.toDate ?? '',
        isOnline: true,
        error: dates ? undefined : 'Could not extract dates from filename',
      })
    })

    if (rejected.length > 0) {
      toast.error(
        `Skipped ${rejected.length} non-ONLINE file(s): ${rejected.slice(0, 3).join(', ')}${rejected.length > 3 ? '…' : ''}`,
      )
    }

    setFiles((prev) => {
      const combined = [...prev, ...valid]
      if (combined.length > 30) {
        toast.error('Maximum 30 files allowed; truncated to 30')
        return combined.slice(0, 30)
      }
      return combined
    })
  }, [])

  const handleOverride = (id: string, value: string | null) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, portfolioOverride: value } : f)),
    )
  }

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const filesMetadata: FileMetadata[] = files.map((f) => ({
    filename: f.file.name,
  }))

  const portfolios = [
    ...new Set(files.map((f) => f.portfolioOverride ?? f.portfolio)),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Multiple Transaction Report Upload
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload one or more raw Perfios TransactionReport XLSX files. Only
          ONLINE files will be processed.
        </p>
      </div>

      <FileDropZone onFiles={handleFiles} maxFiles={30} />

      {files.length > 0 && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {files.length} file{files.length !== 1 ? 's' : ''} ready
                {portfolios.length > 0 && (
                  <span className="text-gray-500 font-normal ml-1">
                    — portfolios: {portfolios.join(', ')}
                  </span>
                )}
              </p>
              <button
                className="text-xs text-red-500 hover:text-red-700"
                onClick={() => setFiles([])}
              >
                Clear all
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {files.map((item) => (
                <FileListItem
                  key={item.id}
                  item={item}
                  onOverrideChange={handleOverride}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
            <ValidationPanel
              filesMetadata={filesMetadata}
              disabled={mutation.isPending}
            />
          </div>

          {mutation.isError && (
            <Alert type="error" title="Processing Failed">
              {(mutation.error as Error).message}
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              size="lg"
              loading={mutation.isPending}
              disabled={files.length === 0}
              onClick={() => mutation.mutate(files)}
            >
              Generate Report
            </Button>
          </div>
        </>
      )}

      {files.length === 0 && (
        <Alert type="info">
          Upload ONLINE Perfios transaction report files. Portfolio will be
          auto-detected from the filename.
        </Alert>
      )}
    </div>
  )
}
