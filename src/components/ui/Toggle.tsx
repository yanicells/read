/** Labelled pill switch: label on the left, switch on the right; accent when on. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-sub/40'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-3 rounded-full bg-bg transition-transform ${
            checked ? 'translate-x-3' : ''
          }`}
        />
      </button>
    </div>
  )
}
