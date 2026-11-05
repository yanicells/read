import { useEffect, useState } from 'react'

const keycap = 'rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text'

/** Quiet end-of-section prompt: "got it?" with [y] continue / [r] reread. Keys are handled by usePacing. */
export function CheckIn({ onResolve }: { section: number; onResolve: (a: 'continue' | 'reread') => void }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-14 z-30 flex justify-center">
      <div
        role="dialog"
        aria-label="Section check-in"
        className={`pointer-events-auto flex items-center gap-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-sub transition duration-300 ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span className="text-text">got it?</span>
        <button type="button" onClick={() => onResolve('continue')} className="flex items-center gap-1.5 hover:text-text">
          <kbd className={keycap}>y</kbd> continue
        </button>
        <button type="button" onClick={() => onResolve('reread')} className="flex items-center gap-1.5 hover:text-text">
          <kbd className={keycap}>r</kbd> reread
        </button>
      </div>
    </div>
  )
}
