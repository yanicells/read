import type { ChartData } from './types'

/**
 * A ```chart fence's JSON as a drawable chart, or null (so the fence shows as code).
 * Drawable: a known type, labels, and every series holding one number per label.
 */
export function parseChart(text: string): ChartData | null {
  try {
    const c = JSON.parse(text) as Partial<ChartData>
    if (!c || !['bar', 'line', 'pie'].includes(c.type as string)) return null
    if (!Array.isArray(c.labels) || c.labels.length === 0) return null
    if (!Array.isArray(c.series) || c.series.length === 0) return null
    const ok = c.series.every(
      (s) => Array.isArray(s?.values) && s.values.length === c.labels!.length && s.values.every((v) => typeof v === 'number'),
    )
    if (!ok) return null
    return {
      type: c.type as ChartData['type'],
      title: String(c.title ?? ''),
      unit: c.unit ? String(c.unit) : undefined,
      labels: c.labels.map(String),
      series: c.series.map((s) => ({ name: String(s.name ?? ''), values: s.values })),
    }
  } catch {
    return null
  }
}
