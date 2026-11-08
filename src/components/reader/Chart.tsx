import type { ChartData } from '../../lib/types'

/**
 * Bar, line and pie charts for ```chart fences, drawn as SVG from data. Ported from think's chart
 * (same JSON format), restyled in this app's tokens: series colours from --series-N, text in --text/--sub.
 */
export function Chart({ chart }: { chart: ChartData }) {
  return (
    <figure className="m-0 max-w-[640px]">
      <figcaption className="mb-2 font-bold">
        {chart.title}
        {chart.unit && <span className="font-normal text-sub"> ({chart.unit})</span>}
      </figcaption>
      {chart.series.length > 1 && chart.type !== 'pie' && <Legend names={chart.series.map((s) => s.name)} />}
      {chart.type === 'pie' ? <Pie chart={chart} /> : <XYChart chart={chart} />}
    </figure>
  )
}

const color = (i: number) => `var(--series-${(i % 5) + 1})`
const num = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
const short = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function Legend({ names }: { names: string[] }) {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.8em] text-sub">
      {names.map((n, i) => (
        <li key={n} className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: color(i) }} />
          {n}
        </li>
      ))}
    </ul>
  )
}

/** Round tick steps (1, 2, 2.5, 5 × 10ⁿ) covering 0 to the max, and below 0 if needed. */
function ticks(min: number, max: number): number[] {
  const lo = Math.min(0, min)
  const hi = Math.max(0, max) || 1
  const raw = (hi - lo) / 5
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let t = Math.floor(lo / step) * step; t <= hi + step * 0.001; t += step) out.push(Number(t.toFixed(10)))
  if (out[out.length - 1] < hi) out.push(out[out.length - 1] + step)
  return out
}

const W = 640
const H = 300
const PAD = { top: 16, right: 16, bottom: 44, left: 52 }

function XYChart({ chart }: { chart: ChartData }) {
  const all = chart.series.flatMap((s) => s.values)
  const ts = ticks(Math.min(...all), Math.max(...all))
  const [lo, hi] = [ts[0], ts[ts.length - 1]]
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const y = (v: number) => PAD.top + plotH - ((v - lo) / (hi - lo)) * plotH
  const band = plotW / chart.labels.length
  const cx = (i: number) => PAD.left + band * (i + 0.5)
  const n = chart.series.length
  const barW = Math.min(24, (band * 0.7) / n)
  const labelBars = chart.labels.length * n <= 16
  const tip = (i: number, name: string, v: number) => `${chart.labels[i]}, ${name}: ${num(v)}${chart.unit ? ` ${chart.unit}` : ''}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${chart.type} chart: ${chart.title}`}>
      {ts.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'stroke-sub' : 'stroke-line'} strokeWidth={1} />
          <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-sub text-[12px] tabular-nums">
            {short(t)}
          </text>
        </g>
      ))}
      {chart.labels.map((label, i) => (
        <text key={label + i} x={cx(i)} y={H - PAD.bottom + 18} textAnchor="middle" className="fill-sub text-[12px]">
          {label}
        </text>
      ))}

      {chart.type === 'bar' &&
        chart.series.map((s, si) =>
          s.values.map((v, i) => {
            const x = cx(i) - (barW * n) / 2 - (n - 1) + si * (barW + 2)
            const top = Math.min(y(v), y(0))
            const h = Math.abs(y(v) - y(0))
            return (
              <g key={`${si}-${i}`}>
                <title>{tip(i, s.name, v)}</title>
                <path d={barPath(x, top, barW, h, v >= 0)} fill={color(si)} />
                {labelBars && (
                  <text x={x + barW / 2} y={v >= 0 ? top - 5 : top + h + 13} textAnchor="middle" className="fill-text text-[11px] tabular-nums">
                    {num(v)}
                  </text>
                )}
              </g>
            )
          }),
        )}

      {chart.type === 'line' &&
        chart.series.map((s, si) => (
          <g key={s.name + si}>
            <polyline
              points={s.values.map((v, i) => `${cx(i)},${y(v)}`).join(' ')}
              fill="none"
              stroke={color(si)}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <g key={i}>
                <title>{tip(i, s.name, v)}</title>
                <circle cx={cx(i)} cy={y(v)} r={4} fill={color(si)} stroke="var(--bg)" strokeWidth={2} />
                {n === 1 && chart.labels.length <= 12 && (
                  <text x={cx(i)} y={y(v) - 10} textAnchor="middle" className="fill-text text-[11px] tabular-nums">
                    {num(v)}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
    </svg>
  )
}

/** A bar with a 4px rounded data end and a square base. */
function barPath(x: number, top: number, w: number, h: number, up: boolean): string {
  const r = Math.min(4, h, w / 2)
  if (up) return `M ${x} ${top + h} V ${top + r} Q ${x} ${top} ${x + r} ${top} H ${x + w - r} Q ${x + w} ${top} ${x + w} ${top + r} V ${top + h} Z`
  return `M ${x} ${top} V ${top + h - r} Q ${x} ${top + h} ${x + r} ${top + h} H ${x + w - r} Q ${x + w} ${top + h} ${x + w} ${top + h - r} V ${top} Z`
}

function Pie({ chart }: { chart: ChartData }) {
  const values = chart.series[0].values
  const total = values.reduce((s, v) => s + v, 0) || 1
  const R = 110
  const isPercent = /^(%|percent)$/i.test(chart.unit?.trim() ?? '')
  // Each slice starts where the previous ones end, from 12 o'clock.
  const starts = values.map((_, i) => -Math.PI / 2 + (values.slice(0, i).reduce((s, v) => s + v, 0) / total) * Math.PI * 2)
  const p = (a: number) => `${R * Math.cos(a)} ${R * Math.sin(a)}`

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg viewBox={`${-R - 4} ${-R - 4} ${2 * R + 8} ${2 * R + 8}`} className="w-48" role="img" aria-label={`Pie chart: ${chart.title}`}>
        {values.map((v, i) => {
          const a0 = starts[i]
          const a1 = a0 + (v / total) * Math.PI * 2
          const d =
            values.length === 1
              ? `M ${-R} 0 A ${R} ${R} 0 1 1 ${R} 0 A ${R} ${R} 0 1 1 ${-R} 0`
              : `M 0 0 L ${p(a0)} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`
          return (
            <path key={i} d={d} fill={color(i)} stroke="var(--bg)" strokeWidth={2}>
              <title>{`${chart.labels[i]}: ${num(v)}`}</title>
            </path>
          )
        })}
      </svg>
      <ul className="space-y-1.5 text-[0.85em]">
        {chart.labels.map((label, i) => (
          <li key={label + i} className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 rounded-sm" style={{ background: color(i) }} />
            <span>{label}</span>
            <span className="text-sub tabular-nums">
              {num(values[i])}
              {isPercent ? '%' : chart.unit ? ` ${chart.unit}` : ''}
              {!isPercent && ` (${Math.round((values[i] / total) * 100)}%)`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
