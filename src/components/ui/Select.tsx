import { useEffect, useId, useRef, useState } from 'react'

export interface SelectOption<T extends string> {
  value: T
  label: string
  /** Muted secondary text shown beside the label in the list. */
  hint?: string
  /** Applied to the option (and the trigger when selected), e.g. to preview a font. */
  className?: string
}

/** Custom dropdown (not a native <select>). Keyboard: ↑/↓ move, Enter picks, Esc closes; click outside closes. */
export function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selected = options.findIndex((o) => o.value === value)
  const current = options[Math.max(selected, 0)]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const show = () => {
    setActive(Math.max(selected, 0))
    setOpen(true)
  }

  const pick = (i: number) => {
    onChange(options[i].value)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return show()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((a) => (a + step + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open) pick(active)
      else show()
    } else if (e.key === 'Escape' && open) {
      // Keep Esc from also closing the surrounding panel.
      e.nativeEvent.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-left text-sm text-text ${current.className ?? ''}`}
      >
        <span>{current.label}</span>
        <svg viewBox="0 0 16 16" className="size-3 text-sub" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-md bg-bg py-1 shadow-md"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
              className={`cursor-pointer px-3 py-1.5 text-sm ${o.className ?? ''} ${
                o.value === value ? 'text-accent' : 'text-text'
              } ${i === active ? 'bg-surface-2' : ''}`}
            >
              <div>{o.label}</div>
              {o.hint && <div className="font-sans text-xs text-sub">{o.hint}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
