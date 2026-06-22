import { useRef } from 'react'
import { Button } from '../ui/Button'

interface FolderInputProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function FolderInput({ onFiles, disabled = false }: FolderInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return
    const files = Array.from(fileList)
    onFiles(files)
    // Reset so selecting same folder again fires onChange
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 hover:border-indigo-400 transition-colors">
      <svg
        className="h-12 w-12 text-gray-400"
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
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Select a root folder containing portfolio sub-folders
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Expected: commercial/, used_cars/ (or similar sub-folders)
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Choose Folder
      </Button>
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error - webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}
