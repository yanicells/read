import { useEffect, useRef, useState } from 'react'
import { columnStyle } from '../../lib/layout'
import type { Settings } from '../../lib/types'
import { FONT_CLASS } from './fonts'
import { MarkdownPreview } from './MarkdownPreview'

const SAMPLE = `# How to use read

Reading long AI answers is easier **one piece at a time**. This is a short tour.

## The basics

- Press **space** or the down arrow to step forward
- Press the up arrow to go back
- Click any dimmed block to jump to it
- Everything else fades away so you can focus on one thing

## Getting set up

1. Paste any markdown into the empty screen
2. Press the start button, or hit cmd + enter
3. Step through the text at your own pace
4. Close the tab whenever you like; your place is saved

## Make it yours

Open the settings to change the font, text size, and line width. Turn on *bionic reading* to bold the start of each word, or *deep focus* to show a single block at a time.

\`\`\`ts
// Code blocks are one chunk, so you can study them calmly
const focus = chunks[index]
\`\`\`

> If you drift off, the current block gently pulses to bring you back.
`

/**
 * Calm editor: a big borderless textarea to paste markdown into.
 * Pass `initialValue` + `onCancel` when editing an open text; Esc then returns to the reader.
 * ⌘⇧↵ flips between the raw text and a rendered markdown preview.
 */
export function PasteScreen({
  settings,
  initialValue = '',
  onSubmit,
  onCancel,
}: {
  settings: Settings
  initialValue?: string
  onSubmit: (markdown: string) => void
  onCancel?: () => void
}) {
  const [value, setValue] = useState(initialValue)
  const [preview, setPreview] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const canSubmit = value.trim().length > 0

  // Pasting while the textarea isn't focused still lands in it.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (document.activeElement === ref.current) return
      const text = e.clipboardData?.getData('text')
      if (!text) return
      e.preventDefault()
      setValue(text)
      ref.current?.focus()
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  const submit = () => {
    if (canSubmit) onSubmit(value)
  }

  // Keys shared by the textarea and the preview. Returns true when the key was handled.
  const handleKey = (e: KeyboardEvent | React.KeyboardEvent): boolean => {
    const mod = e.metaKey || e.ctrlKey
    if (e.key === 'Enter' && mod && e.shiftKey) {
      if (canSubmit || preview) setPreview(!preview)
    } else if (e.key === 'Enter' && mod) submit()
    else if (e.key === 'Escape' && preview) setPreview(false)
    else if (e.key === 'Escape' && onCancel) onCancel()
    else return false
    e.preventDefault()
    return true
  }

  // The preview has no focusable element, so listen on the window while it's shown.
  // Keys aimed at other UI (e.g. the settings drawer) are left alone.
  useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as Node | null
      if (t && t !== document.body && !mainRef.current?.contains(t)) return
      handleKey(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <main ref={mainRef} className="flex min-h-screen flex-col items-center px-6 pt-28 pb-16">
      <div className={`${FONT_CLASS[settings.font]} flex w-full flex-1 flex-col`} style={columnStyle({ fontSize: settings.editorFontSize, lineWidth: settings.editorLineWidth })}>
        {preview ? (
          <MarkdownPreview markdown={value} />
        ) : (
          <textarea
            ref={ref}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder="paste something to read…"
            spellCheck={false}
            className={`min-h-[60vh] w-full flex-1 resize-none border-0 bg-transparent leading-relaxed text-text caret-accent outline-none placeholder:text-sub`}
          />
        )}
        <div className="mt-8 flex items-center justify-between text-xs text-sub/70">
          <span>
            {preview
              ? '⌘ ⇧ ↵ to edit · ⌘ ↵ to read'
              : onCancel
                ? '⌘ ↵ to read · ⌘ ⇧ ↵ preview · esc to go back'
                : '⌘ ↵ to start · ⌘ ⇧ ↵ preview · ? for keys'}
          </span>
          {!canSubmit && (
            <button
              type="button"
              onClick={() => onSubmit(SAMPLE)}
              className="cursor-pointer transition-colors hover:text-text"
            >
              sample
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
