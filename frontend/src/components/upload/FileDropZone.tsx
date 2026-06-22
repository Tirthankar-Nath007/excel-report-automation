import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface FileDropZoneProps {
  onFiles: (files: File[]) => void
  maxFiles?: number
  accept?: Record<string, string[]>
  label?: string
  disabled?: boolean
}

export function FileDropZone({
  onFiles,
  maxFiles = 30,
  accept = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
      '.xlsx',
    ],
  },
  label = 'Drop .xlsx files here or click to browse',
  disabled = false,
}: FileDropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: { file: File }[]) => {
      if (rejected.length > 0) {
        toast.error(`${rejected.length} file(s) rejected — XLSX only`)
      }
      if (accepted.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        onFiles(accepted.slice(0, maxFiles))
        return
      }
      if (accepted.length > 0) onFiles(accepted)
    },
    [onFiles, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled,
    multiple: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <svg
          className={`h-10 w-10 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop files here' : label}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            XLSX only · Max {maxFiles} files
          </p>
        </div>
      </div>
    </div>
  )
}
