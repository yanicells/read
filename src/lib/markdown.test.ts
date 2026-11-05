import { expect, test } from 'bun:test'
import { parseChunks } from './markdown'

test('maps each block kind to a chunk with sequential ids', () => {
  const md = '# Title\n\nPara\n\n> quote\n\n```js\nconst a = 1 < 2\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n---\n'
  const chunks = parseChunks(md)
  expect(chunks.map((c) => c.kind)).toEqual(['heading', 'paragraph', 'blockquote', 'code', 'table', 'hr'])
  expect(chunks.map((c) => c.id)).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5'])
  expect(chunks[0].level).toBe(1)
  expect(chunks[3].html).toContain('<pre><code class="language-js">const a = 1 &lt; 2')
})

test('list items are separate chunks with inner-only html', () => {
  const chunks = parseChunks('1. First **step**\n2. Second\n')
  expect(chunks.map((c) => c.html)).toEqual(['First <strong>step</strong>', 'Second'])
  expect(chunks.map((c) => [c.ordered, c.start])).toEqual([
    [true, 1],
    [true, 2],
  ])
})

test('ordered list keeps the real start number', () => {
  const chunks = parseChunks('5. five\n6. six\n')
  expect(chunks.map((c) => c.start)).toEqual([5, 6])
})

test('nested lists are flattened after their parent, excluded from its html', () => {
  const chunks = parseChunks('- parent\n  - child\n    - grandchild\n- sibling\n')
  expect(chunks.map((c) => [c.text, c.level])).toEqual([
    ['parent', 0],
    ['child', 1],
    ['grandchild', 2],
    ['sibling', 0],
  ])
  expect(chunks[0].html).toBe('parent')
  expect(chunks[0].ordered).toBe(false)
})

test('task list items get a checkbox glyph prefix', () => {
  const chunks = parseChunks('- [x] done\n- [ ] todo\n')
  expect(chunks.map((c) => c.html)).toEqual(['☑ done', '☐ todo'])
})

test('sections increment at headings; endsSection marks the last chunk before one', () => {
  const chunks = parseChunks('intro\n\n# A\n\none\n\ntwo\n\n## B\n\nthree\n')
  expect(chunks.map((c) => c.section)).toEqual([0, 1, 1, 1, 2, 2])
  expect(chunks.map((c) => c.endsSection)).toEqual([true, false, false, true, false, true])
})

test('raw and inline html is escaped, unsafe links dropped, safe links open in new tab', () => {
  const chunks = parseChunks(
    '<div onclick="x">hi</div>\n\nA <script>alert(1)</script> [ok](https://a.com) [bad](javascript:alert(1))\n',
  )
  expect(chunks[0].kind).toBe('paragraph')
  expect(chunks[0].html).not.toContain('<div')
  expect(chunks[1].html).not.toContain('<script')
  expect(chunks[1].html).toContain('<a href="https://a.com" target="_blank" rel="noreferrer">ok</a>')
  expect(chunks[1].html).not.toContain('javascript:')
})

test('text is plain, wordCount derived from it', () => {
  const [c] = parseChunks('## **Bold** heading with `code` 🎉')
  expect(c.text).toBe('Bold heading with code 🎉')
  expect(c.wordCount).toBe(5)
  expect(parseChunks('')).toEqual([])
})
