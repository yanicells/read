import type { Editor } from '@tiptap/core'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { columnStyle } from '../../lib/layout'
import type { Settings } from '../../lib/types'
import { FONT_CLASS } from './fonts'

// Tiptap is heavy; load it only when the editor is actually shown.
const RichEditor = lazy(() => import('../editor/RichEditor').then((m) => ({ default: m.RichEditor })))

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

## Diagrams and charts

Mermaid diagrams and chart blocks draw themselves, and ==highlights== stand out.

\`\`\`mermaid
flowchart LR
  A["Paste"] --> B["Step through"] --> C["Done"]
\`\`\`
`

/**
 * The editor screen: a borderless rich editor to paste or write markdown into.
 * Pass `initialValue` + `onCancel` when editing an open text; Esc then returns to the reader.
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
  const [empty, setEmpty] = useState(initialValue.trim().length === 0)
  const editor = useRef<Editor | null>(null)

  // Pasting while the editor isn't focused still lands in it (as markdown).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const ed = editor.current
      if (!ed || ed.isFocused) return
      const text = e.clipboardData?.getData('text')
      if (!text) return
      e.preventDefault()
      ed.chain().focus('end').insertContent(text, { contentType: 'markdown' }).run()
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  const submit = () => {
    if (!empty) onSubmit(value)
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-6 pt-28 pb-16">
      <div
        className={`${FONT_CLASS[settings.font]} flex w-full flex-1 flex-col`}
        style={columnStyle({ fontSize: settings.editorFontSize, lineWidth: settings.editorLineWidth })}
      >
        <Suspense fallback={<div className="min-h-[60vh] flex-1" />}>
          <RichEditor
            initialMarkdown={initialValue}
            editorRef={editor}
            onChange={(md, isEmpty) => {
              setValue(md)
              setEmpty(isEmpty)
            }}
            onSubmit={submit}
            onCancel={onCancel}
          />
        </Suspense>
        <div className="mt-8 flex items-center justify-between text-xs text-sub/70">
          <span>{onCancel ? '⌘ ↵ to read · esc to go back' : '⌘ ↵ to start · space to step · ? for keys'}</span>
          {empty && (
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
