import { Extension, type Editor } from '@tiptap/core'
import { Markdown } from '@tiptap/markdown'
import { Plugin } from '@tiptap/pm/state'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { useEffect, useRef } from 'react'
import { EDITOR_CSS } from './editorStyles'

/** Plain text that reads like markdown (headings, lists, quotes, fences, bold, highlights, inline code). */
const LOOKS_LIKE_MD = /^(#{1,6}\s|\s*[-*+]\s|\s*\d+[.)]\s|>|```|\|)|\*\*|__|==\S|`[^`]+`|\[[^\]]+\]\(/m

/**
 * Pasted markdown (what LLM "copy" buttons give you) becomes rich content instead of raw symbols.
 * Rich HTML pastes are left to the editor's normal handling.
 */
const MarkdownPaste = Extension.create({
  name: 'markdownPaste',
  addProseMirrorPlugins() {
    const editor = this.editor
    return [
      new Plugin({
        props: {
          handlePaste(_view, event) {
            const text = event.clipboardData?.getData('text/plain')
            const html = event.clipboardData?.getData('text/html')
            if (!text || (html && !LOOKS_LIKE_MD.test(text))) return false
            editor.commands.insertContent(text, { contentType: 'markdown' })
            return true
          },
        },
      }),
    ]
  },
})

interface RichEditorProps {
  initialMarkdown: string
  /** Called with the current markdown on every change. */
  onChange: (markdown: string, empty: boolean) => void
  /** ⌘↵ */
  onSubmit: () => void
  /** Esc */
  onCancel?: () => void
  /** Exposes the editor so the parent can insert pastes made outside it. */
  editorRef?: React.RefObject<Editor | null>
}

/**
 * Notion-style editor: markdown shortcuts (`# `, `- `, `**bold**`, ``` fences) render as you type,
 * and the document is read and written as markdown so the reader stays markdown-based.
 */
export function RichEditor({ initialMarkdown, onChange, onSubmit, onCancel, editorRef }: RichEditorProps) {
  // Latest callbacks for the editor's key handler, which is created once.
  const keys = useRef({ onSubmit, onCancel })
  useEffect(() => {
    keys.current = { onSubmit, onCancel }
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TableKit,
      Highlight,
      Placeholder.configure({ placeholder: 'paste something to read…' }),
      Markdown,
      MarkdownPaste,
    ],
    content: initialMarkdown,
    contentType: 'markdown',
    autofocus: 'end',
    editorProps: {
      attributes: { class: 'read-editor outline-none', spellcheck: 'false' },
      handleKeyDown(_view, e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          keys.current.onSubmit()
          return true
        }
        if (e.key === 'Escape' && keys.current.onCancel) {
          e.preventDefault()
          keys.current.onCancel()
          return true
        }
        return false
      },
    },
    onCreate: ({ editor }) => onChange(editor.getMarkdown(), editor.isEmpty),
    onUpdate: ({ editor }) => onChange(editor.getMarkdown(), editor.isEmpty),
  })

  useEffect(() => {
    if (editorRef) editorRef.current = editor
  }, [editor, editorRef])

  return (
    <>
      <style>{EDITOR_CSS}</style>
      <EditorContent editor={editor} className="min-h-[60vh] w-full flex-1 cursor-text text-text" />
    </>
  )
}
