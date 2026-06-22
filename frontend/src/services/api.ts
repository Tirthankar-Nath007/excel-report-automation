import axios from 'axios'
import type { ValidationResponse } from '../types'

const client = axios.create({ baseURL: '/' })

export async function processReports(
  files: File[],
  portfolioOverrides: Record<string, string>,
): Promise<{ blob: Blob; filename: string }> {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  form.append('portfolio_overrides', JSON.stringify(portfolioOverrides))
  const res = await client.post('/api/reports/process', form, {
    responseType: 'blob',
  })
  const cd = res.headers['content-disposition'] as string | undefined
  const filename = extractFilename(cd, 'report.xlsx')
  return { blob: res.data as Blob, filename }
}

export async function mergeReports(
  files: File[],
): Promise<{ blob: Blob; filename: string }> {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  const res = await client.post('/api/reports/merge', form, {
    responseType: 'blob',
  })
  const cd = res.headers['content-disposition'] as string | undefined
  const filename = extractFilename(cd, 'merged_report.xlsx')
  return { blob: res.data as Blob, filename }
}

export async function folderProcess(
  files: File[],
  relativePaths: string[],
): Promise<{ blob: Blob; filename: string }> {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  form.append('relative_paths', JSON.stringify(relativePaths))
  const res = await client.post('/api/reports/folder-process', form, {
    responseType: 'blob',
  })
  const cd = res.headers['content-disposition'] as string | undefined
  const filename = extractFilename(cd, 'report.xlsx')
  return { blob: res.data as Blob, filename }
}

export async function validateReports(
  filesMetadata: { filename: string; relative_path?: string }[],
  mode: string,
  customDays?: number,
): Promise<ValidationResponse> {
  const res = await client.post<ValidationResponse>('/api/reports/validate', {
    files_metadata: filesMetadata,
    mode,
    custom_days: customDays ?? null,
  })
  return res.data
}

function extractFilename(header: string | undefined, fallback: string): string {
  if (!header) return fallback
  const m = header.match(/filename="?([^";\n]+)"?/)
  return m ? m[1].trim() : fallback
}
