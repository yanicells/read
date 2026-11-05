import { expect, test } from 'bun:test'
import { applyBionic } from './bionic'

const b = (s: string) => `<b class="bionic">${s}</b>`

test('bolds the leading fraction of each word, min 1, short words get 1 char', () => {
  expect(applyBionic('<p>reading is fun</p>', 0.5)).toBe(`<p>${b('read')}ing ${b('i')}s ${b('f')}un</p>`)
  expect(applyBionic('word', 0.01)).toBe(`${b('w')}ord`)
})

test('leaves punctuation and numbers untouched', () => {
  expect(applyBionic('Hello, 2024! ok?', 0.5)).toBe(`${b('Hel')}lo, 2024! ${b('o')}k?`)
})

test('never splits or alters HTML entities', () => {
  const out = applyBionic('<p>a &amp; b &lt;tag&gt; &#8212; x</p>', 0.5)
  expect(out).toContain('&amp;')
  expect(out).toContain('&lt;')
  expect(out).toContain('&gt;')
  expect(out).toContain('&#8212;')
  expect(out).not.toMatch(/<b class="bionic">[^<]*&[^;<]*<\/b>/)
})

test('keeps contractions (incl. &#39;) as one word', () => {
  expect(applyBionic('don&#39;t', 0.5)).toBe(`${b('don')}&#39;t`)
})

test('skips code, pre and kbd content but handles text around them', () => {
  const html = '<p>use <code>some word</code> now</p><pre><code>let value</code></pre><kbd>Ctrl</kbd>'
  const out = applyBionic(html, 0.5)
  expect(out).toContain('<code>some word</code>')
  expect(out).toContain('<pre><code>let value</code></pre>')
  expect(out).toContain('<kbd>Ctrl</kbd>')
  expect(out).toContain(`${b('u')}se`)
  expect(out).toContain(`${b('n')}ow`)
})

test('applies inside links and never touches tag attributes', () => {
  const out = applyBionic('<a href="https://example.com/long-path" class="x">linked text</a>', 0.5)
  expect(out).toContain('<a href="https://example.com/long-path" class="x">')
  expect(out).toContain(`${b('lin')}ked ${b('te')}xt`)
})

test('handles unicode letters', () => {
  expect(applyBionic('café über', 0.5)).toBe(`${b('ca')}fé ${b('üb')}er`)
})
