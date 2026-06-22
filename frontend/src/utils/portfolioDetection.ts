export function detectPortfolio(filename: string): string {
  const match = filename.match(/tvsCredit([^-]*)/i)
  if (!match) return 'unknown'
  const suffix = match[1].trim()
  return suffix === '' ? 'commercial' : suffix.toLowerCase()
}

export function extractDates(
  filename: string,
): { fromDate: string; toDate: string } | null {
  const m = filename.match(
    /From-(\d{4}-\d{2}-\d{2})-To-(\d{4}-\d{2}-\d{2})/,
  )
  if (!m) return null
  return { fromDate: m[1], toDate: m[2] }
}

export function isOnlineFile(filename: string): boolean {
  return filename.toUpperCase().includes('ONLINE')
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
