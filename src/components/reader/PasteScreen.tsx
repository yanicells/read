import { useEffect, useRef, useState } from 'react'
import { columnStyle } from '../../lib/layout'
import type { Settings } from '../../lib/types'
import { FONT_CLASS } from './fonts'

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

/** Calm empty state: a big borderless textarea to paste markdown into. */
export function PasteScreen({ settings, onSubmit }: { settings: Settings; onSubmit: (markdown: string) => void }) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
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

  return (
    <main className="flex min-h-screen flex-col items-center px-6 pt-28 pb-16">
      <div className={`${FONT_CLASS[settings.font]} flex w-full flex-1 flex-col`} style={columnStyle(settings)}>
        <textarea
          ref={ref}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="paste something to read…"
          spellCheck={false}
          className={`min-h-[60vh] w-full flex-1 resize-none border-0 bg-transparent leading-relaxed text-text caret-accent outline-none placeholder:text-sub`}
        />
        <div className="mt-8 flex items-center justify-between text-xs text-sub/70">
          <span>⌘ ↵ to start · space to step · ? for keys</span>
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
