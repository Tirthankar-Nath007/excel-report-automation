import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { validateReports } from '../services/api'
import type { FileMetadata, ValidationResponse } from '../types'

export function useValidation() {
  return useMutation<
    ValidationResponse,
    Error,
    {
      filesMetadata: FileMetadata[]
      mode: string
      customDays?: number
    }
  >({
    mutationFn: ({ filesMetadata, mode, customDays }) =>
      validateReports(filesMetadata, mode, customDays),
    onError: (err) => {
      toast.error(`Validation failed: ${err.message}`)
    },
  })
}
