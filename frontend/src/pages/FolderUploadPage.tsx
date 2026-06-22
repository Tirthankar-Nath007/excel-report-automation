import { useState, useCallback } from 'react'
import { FolderInput } from '../components/upload/FolderInput'
import { ValidationPanel } from '../components/validation/ValidationPanel'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { useFolderProcess } from '../hooks/useFolderProcess'
import type { FileMetadata, FolderGroup } from '../types'
import {
  detectPortfolio,
  extractDates,
  isOnlineFile,
  formatDate,
} from '../utils/portfolioDetection'

function buildFolderGroups(files: File[]): FolderGroup[] {
  const groupMap = new Map<string, FolderGroup>()

  files.forEach((f) => {
    const relPath = (f as File & { webkitRelativePath: string })
      .webkitRelativePath
    if (!relPath || !isOnlineFile(f.name)) return

    const parts = relPath.split('/')
    // Use the immediate parent directory of the file, not the root folder
    const folder = parts.length >= 2 ? parts[parts.length - 2] : parts[0]
    if (!groupMap.has(folder)) {
      const portfolio = detectPortfolio(f.name)
      groupMap.set(folder, { folder, portfolio, files: [], dates: [] })
    }

    const group = groupMap.get(folder)!
    group.files.push(f)

    const dates = extractDates(f.name)
    if (dates) {
      group.dates.push(dates.fromDate)
    }
  })

  return Array.from(groupMap.values())
}

export function FolderUploadPage() {
  const [groups, setGroups] = useState<FolderGroup[]>([])
  const [allFiles, setAllFiles] = useState<File[]>([])
  const mutation = useFolderProcess()

  const handleFiles = useCallback((files: File[]) => {
    const online = files.filter((f) => isOnlineFile(f.name))
    setAllFiles(files)
    setGroups(buildFolderGroups(files))

    const skipped = files.length - online.length
    if (skipped > 0) {
      // Non-ONLINE files silently excluded; no toast needed unless user cares
    }
  }, [])

  const filesMetadata: FileMetadata[] = allFiles
    .filter((f) => isOnlineFile(f.name))
    .map((f) => ({
      filename: f.name,
      relative_path: (f as File & { webkitRelativePath: string })
        .webkitRelativePath,
    }))

  const totalOnline = groups.reduce((acc, g) => acc + g.files.length, 0)

  const handleProcess = () => {
    const onlineFiles = allFiles.filter((f) => isOnlineFile(f.name))
    const relativePaths = onlineFiles.map(
      (f) =>
        (f as File & { webkitRelativePath: string }).webkitRelativePath,
    )
    mutation.mutate({ files: onlineFiles, relativePaths })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Folder Upload Mode
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a root folder containing sub-folders per portfolio (e.g.{' '}
          <code className="font-mono text-xs bg-gray-100 px-1 rounded">
            commercial/
          </code>
          ,{' '}
          <code className="font-mono text-xs bg-gray-100 px-1 rounded">
            used_cars/
          </code>
          ). All ONLINE files will be processed and merged into one report.
        </p>
      </div>

      <FolderInput onFiles={handleFiles} disabled={mutation.isPending} />

      {groups.length > 0 && (
        <>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Detected Structure — {totalOnline} ONLINE file
              {totalOnline !== 1 ? 's' : ''} across {groups.length} portfolio
              {groups.length !== 1 ? 's' : ''}
            </p>

            <div className="divide-y border rounded-xl overflow-hidden">
              {groups.map((group) => {
                const sortedDates = [...group.dates].sort()
                const minDate = sortedDates[0]
                const maxDate = sortedDates[sortedDates.length - 1]

                return (
                  <div
                    key={group.folder}
                    className="flex items-center gap-4 px-4 py-3 bg-white"
                  >
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <svg
                        className="h-4 w-4 text-amber-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {group.folder}
                      </span>
                    </div>

                    <Badge>{group.portfolio}</Badge>

                    <span className="text-sm text-gray-500 flex-1">
                      {group.files.length} file
                      {group.files.length !== 1 ? 's' : ''}
                    </span>

                    {minDate && (
                      <span className="text-xs text-gray-500 shrink-0">
                        {formatDate(minDate)}
                        {maxDate !== minDate && ` – ${formatDate(maxDate)}`}
                      </span>
                    )}
                  </div>
                )
              })}
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
              disabled={totalOnline === 0}
              onClick={handleProcess}
            >
              Process Folder &amp; Download Report
            </Button>
          </div>
        </>
      )}

      {groups.length === 0 && (
        <Alert type="info">
          Select a folder with the structure:{' '}
          <code className="font-mono text-xs">
            root/ → commercial/ → TransactionReport-*.xlsx
          </code>
        </Alert>
      )}
    </div>
  )
}
