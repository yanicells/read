/** Thin range slider with the label on the left and the current value (mono, muted) on the right. Track styling lives in index.css (.range). */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format = String,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Formats the displayed value, e.g. (v) => `${v}px`. */
  format?: (value: number) => string
  onChange: (value: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="block py-1 text-sm">
      <span className="flex items-baseline justify-between">
        <span className="text-text">{label}</span>
        <span className="font-mono text-xs text-sub">{format(value)}</span>
      </span>
      <input
        type="range"
        className="range mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
