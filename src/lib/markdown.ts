import { Marked, type Token, type Tokens } from 'marked'
import type { Chunk } from './types'

const SAFE_URL = /^(https?:|mailto:|#|\/)/i

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// marked doesn't sanitize: escape raw HTML, open links in a new tab, drop unsafe URL schemes.
const marked = new Marked({
  gfm: true,
  renderer: {
    html: (token) => escapeHtml(token.text),
    link(token) {
      const inner = this.parser.parseInline(token.tokens)
      if (!SAFE_URL.test(token.href)) return inner
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : ''
      return `<a href="${escapeHtml(token.href)}"${title} target="_blank" rel="noreferrer">${inner}</a>`
    },
    image: (token) => (SAFE_URL.test(token.href) ? false : escapeHtml(token.text)),
  },
})

const inline = (tokens: Token[]) => marked.Parser.parseInline(tokens, marked.defaults).trim()
const block = (token: Token) => marked.Parser.parse([token], marked.defaults).trim()

const INLINE = new Set(['text', 'escape', 'strong', 'em', 'del', 'codespan', 'link', 'image', 'br', 'html'])

/** Plain text of a token tree (markdown stripped), whitespace-normalized. */
function plain(tokens: Token[]): string {
  // Inline tokens concatenate directly; block tokens are separated by a space.
  return tokens.map((t) => plainOne(t) + (INLINE.has(t.type) ? '' : ' ')).join('').replace(/\s+/g, ' ').trim()
}

function plainOne(t: Token): string {
  switch (t.type) {
    case 'space':
    case 'hr':
    case 'checkbox':
      return ''
    case 'br':
      return ' '
    case 'table': {
      const table = t as Tokens.Table
      const cells = [table.header, ...table.rows].flat()
      return cells.map((c) => plain(c.tokens)).join(' ')
    }
    case 'list':
      return (t as Tokens.List).items.map((i) => plain(i.tokens)).join(' ')
    default:
      return 'tokens' in t && Array.isArray(t.tokens) ? plain(t.tokens) : 'text' in t ? String(t.text) : ''
  }
}

type Draft = Pick<Chunk, 'kind' | 'level' | 'html' | 'text'> & Partial<Pick<Chunk, 'ordered' | 'start'>>

/** Inner HTML of a list item without its nested lists; loose/multi-block items become <p>s. */
function listItemHtml(item: Tokens.ListItem): string {
  const parts = item.tokens
    .filter((t) => t.type !== 'list' && t.type !== 'space' && t.type !== 'checkbox')
    .map((t) =>
      t.type === 'text' || t.type === 'paragraph'
        ? { html: inline((t as Tokens.Text).tokens ?? []), inline: true }
        : { html: block(t), inline: false },
    )
  if (item.task) {
    const box = item.checked ? '☑ ' : '☐ '
    if (parts[0]?.inline) parts[0].html = box + parts[0].html
    else parts.unshift({ html: box.trim(), inline: true })
  }
  if (parts.length === 1 && parts[0].inline) return parts[0].html
  return parts.map((p) => (p.inline ? `<p>${p.html}</p>` : p.html)).join('')
}

/** Pushes one chunk per item, with nested lists flattened after their parent at depth+1. */
function flattenList(list: Tokens.List, depth: number, out: Draft[]) {
  const first = typeof list.start === 'number' ? list.start : 1
  list.items.forEach((item, i) => {
    const own = item.tokens.filter((t) => t.type !== 'list')
    const box = item.task ? (item.checked ? '☑ ' : '☐ ') : ''
    out.push({
      kind: 'list-item',
      level: depth,
      html: listItemHtml(item),
      text: (box + own.map((t) => plain([t])).join(' ')).trim(),
      ...(list.ordered ? { ordered: true, start: first + i } : { ordered: false }),
    })
    for (const t of item.tokens) if (t.type === 'list') flattenList(t as Tokens.List, depth + 1, out)
  })
}

function tokenToDrafts(t: Token, out: Draft[]) {
  switch (t.type) {
    case 'space':
      return
    case 'heading':
      out.push({ kind: 'heading', level: (t as Tokens.Heading).depth, html: block(t), text: plain([t]) })
      return
    case 'list':
      flattenList(t as Tokens.List, 0, out)
      return
    case 'hr':
      out.push({ kind: 'hr', level: 0, html: '<hr>', text: '' })
      return
    case 'code':
      out.push({ kind: 'code', level: 0, html: block(t), text: (t as Tokens.Code).text })
      return
    case 'blockquote':
    case 'table':
      out.push({ kind: t.type, level: 0, html: block(t), text: plain([t]) })
      return
    case 'html': {
      // Raw HTML blocks become escaped text paragraphs.
      const raw = (t as Tokens.HTML).text.trim()
      if (raw) out.push({ kind: 'paragraph', level: 0, html: `<p>${escapeHtml(raw)}</p>`, text: raw })
      return
    }
    default:
      out.push({ kind: 'paragraph', level: 0, html: block(t), text: plain([t]) })
  }
}

/**
 * Splits markdown into focusable chunks: one per heading/paragraph/blockquote/code/table/hr,
 * and one per list item (nested items flattened with `level` = depth). HTML is sanitized.
 */
export function parseChunks(markdown: string): Chunk[] {
  const drafts: Draft[] = []
  for (const t of marked.lexer(markdown)) tokenToDrafts(t, drafts)

  let section = 0
  return drafts.map((d, i) => {
    if (d.kind === 'heading') section++
    const text = d.text.replace(/\s+/g, ' ').trim()
    return {
      id: `c${i}`,
      ...d,
      text,
      wordCount: text ? text.split(' ').length : 0,
      section,
      endsSection: i === drafts.length - 1 || drafts[i + 1].kind === 'heading',
    }
  })
}
