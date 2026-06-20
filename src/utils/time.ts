const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/** Short relative time, e.g. "5m", "3h", "2d", "4w" — like Instagram timestamps. */
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < MINUTE) return 'now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`
  return `${Math.floor(diff / WEEK)}w`
}

/** Long relative time used on post detail pages, e.g. "3 DAYS AGO". */
export function timeAgoLong(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < HOUR) {
    const m = Math.max(1, Math.floor(diff / MINUTE))
    return `${m} ${m === 1 ? 'MINUTE' : 'MINUTES'} AGO`
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR)
    return `${h} ${h === 1 ? 'HOUR' : 'HOURS'} AGO`
  }
  const d = Math.floor(diff / DAY)
  return `${d} ${d === 1 ? 'DAY' : 'DAYS'} AGO`
}

/** Compact number formatting: 1200 -> "1,200", 1500000 -> "1.5m". */
export function formatCount(n: number): string {
  if (n < 10000) return n.toLocaleString('en-US')
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return `${(n / 1_000_000).toFixed(1)}m`
}
