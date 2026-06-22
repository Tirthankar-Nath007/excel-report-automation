import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { processReports } from '../services/api'
import { downloadBlob } from '../utils/download'
import type { FileWithMeta } from '../types'

export function useProcessReports() {
  return useMutation({
    mutationFn: async (files: FileWithMeta[]) => {
      const overrides: Record<string, string> = {}
      files.forEach((f) => {
        if (f.portfolioOverride) {
          overrides[f.file.name] = f.portfolioOverride
        }
      })
      return processReports(
        files.map((f) => f.file),
        overrides,
      )
    },
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      toast.success(`Report downloaded: ${filename}`)
    },
    onError: (err: Error) => {
      toast.error(`Failed to generate report: ${err.message}`)
    },
  })
}
