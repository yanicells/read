import { useEffect, useState } from 'react'

const GROUPS: { title: string; rows: [keys: string[], label: string][] }[] = [
  {
    title: 'move',
    rows: [
      [['space', '↓', 'j', '→'], 'next'],
      [['shift+space', '↑', 'k', '←'], 'previous'],
      [['home', 'g'], 'first'],
      [['end', 'G'], 'last'],
    ],
  },
  {
    title: 'modes',
    rows: [
      [['a'], 'auto-advance'],
      [['['], 'slower (−20 wpm)'],
      [[']'], 'faster (+20 wpm)'],
      [['f'], 'deep focus'],
      [['b'], 'bionic'],
      [['t'], 'theme'],
    ],
  },
  {
    title: 'other',
    rows: [
      [['?'], 'this help'],
      [[','], 'settings'],
      [['n'], 'new text'],
      [['esc'], 'close'],
    ],
  },
]

function Panel({ onClose }: { onClose: () => void }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid gap-x-12 gap-y-6 rounded-lg border border-line bg-surface px-8 py-6 text-sm text-sub sm:grid-cols-3"
      >
        {GROUPS.map((g) => (
          <section key={g.title} className="space-y-2">
            <h2 className="font-mono text-xs text-sub">{g.title}</h2>
            {g.rows.map(([keys, label]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span>{label}</span>
                <span className="flex gap-1">
                  {keys.map((k) => (
                    <kbd key={k} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text">
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

/** Plain keymap on a dimmed backdrop. Click outside (or Esc, via usePacing) to close. */
export function HelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <Panel onClose={onClose} /> : null
}
