import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { folderProcess } from '../services/api'
import { downloadBlob } from '../utils/download'

export function useFolderProcess() {
  return useMutation({
    mutationFn: ({
      files,
      relativePaths,
    }: {
      files: File[]
      relativePaths: string[]
    }) => folderProcess(files, relativePaths),
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      toast.success(`Report downloaded: ${filename}`)
    },
    onError: (err: Error) => {
      toast.error(`Failed to process folder: ${err.message}`)
    },
  })
}
