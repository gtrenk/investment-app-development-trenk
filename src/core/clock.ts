// Injected clock so every engine is a pure, testable function of its inputs.

export interface Clock {
  /** Current local date as 'YYYY-MM-DD' */
  today(): string
  /** Current instant as ISO string */
  now(): string
}

/** Format a Date as a local 'YYYY-MM-DD' string (never UTC — avoids midnight bugs) */
export function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add n days to a 'YYYY-MM-DD' local date string */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return localDateStr(dt)
}

/** Whole days from a to b (positive when b is after a) */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const utcA = Date.UTC(ay, am - 1, ad)
  const utcB = Date.UTC(by, bm - 1, bd)
  return Math.round((utcB - utcA) / 86_400_000)
}

export const systemClock: Clock = {
  today: () => localDateStr(new Date()),
  now: () => new Date().toISOString(),
}
