import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { mergeReports } from '../services/api'
import { downloadBlob } from '../utils/download'

export function useMergeReports() {
  return useMutation({
    mutationFn: (files: File[]) => mergeReports(files),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      toast.success(`Merged report downloaded: ${filename}`)
    },
    onError: (err: Error) => {
      toast.error(`Merge failed: ${err.message}`)
    },
  })
}
