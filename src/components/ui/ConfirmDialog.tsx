import { useEffect, useState } from 'react'

const keycap = 'rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text'

interface ConfirmDialogProps {
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Quiet in-app replacement for window.confirm. Mount it only while asking. Enter confirms, Esc cancels.
 * Keys are caught in the capture phase and stopped, so the reader's hotkeys don't also fire.
 */
export function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation()
      if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [onConfirm, onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onCancel}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${shown ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={message}
        className={`relative flex flex-col gap-5 rounded-lg bg-surface px-6 py-5 text-sm transition duration-200 ${
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <p className="text-text">{message}</p>
        <div className="flex items-center justify-end gap-5 text-sub">
          <button type="button" onClick={onCancel} className="flex cursor-pointer items-center gap-1.5 hover:text-text">
            <kbd className={keycap}>esc</kbd> cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex cursor-pointer items-center gap-1.5 text-accent hover:brightness-110">
            <kbd className={keycap}>↵</kbd> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
