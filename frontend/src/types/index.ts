export interface FileWithMeta {
  file: File
  id: string
  portfolio: string
  portfolioOverride: string | null
  fromDate: string
  toDate: string
  isOnline: boolean
  error?: string
}

export interface ValidationResult {
  portfolio: string
  validation_mode: string
  start_date: string
  expected_dates: string[]
  available_dates: string[]
  missing_dates: string[]
  is_complete: boolean
}

export interface ValidationResponse {
  results: ValidationResult[]
}

export interface FileMetadata {
  filename: string
  relative_path?: string
}

export interface FolderGroup {
  folder: string
  portfolio: string
  files: File[]
  dates: string[]
}
