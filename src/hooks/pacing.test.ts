import { describe, expect, test } from 'bun:test'
import type { Chunk } from '../lib/types'
import { clampWpm, dwellMs, keyToAction, sectionStart, wordsLeft } from './pacing'

const chunk = (over: Partial<Chunk>): Chunk => ({
  id: 'c0',
  kind: 'paragraph',
  level: 0,
  html: '',
  text: '',
  wordCount: 0,
  section: 0,
  endsSection: false,
  ...over,
})

describe('dwellMs', () => {
  test('scales with word count and wpm, with a 1.5s floor', () => {
    expect(dwellMs(chunk({ wordCount: 5 }), 230)).toBe(1500)
    expect(dwellMs(chunk({ wordCount: 230 }), 230)).toBe(60000)
    expect(dwellMs(chunk({ wordCount: 100 }), 200)).toBe(30000)
  })

  test('headings are short; code and tables get 1.5x', () => {
    expect(dwellMs(chunk({ kind: 'heading', wordCount: 40 }), 230)).toBe(1200)
    expect(dwellMs(chunk({ kind: 'code', wordCount: 230 }), 230)).toBe(90000)
    expect(dwellMs(chunk({ kind: 'table', wordCount: 1 }), 230)).toBe(2250)
  })
})

describe('sectionStart / wordsLeft', () => {
  const chunks = [
    chunk({ section: 0, wordCount: 3 }),
    chunk({ section: 1, wordCount: 4 }),
    chunk({ section: 1, wordCount: 5 }),
  ]
  test('finds the first chunk of a section', () => {
    expect(sectionStart(chunks, 1)).toBe(1)
    expect(sectionStart(chunks, 9)).toBe(0)
  })
  test('counts words from the current chunk on', () => {
    expect(wordsLeft(chunks, 1)).toBe(9)
  })
})

describe('keys', () => {
  test('Space is next, Shift+Space is prev', () => {
    expect(keyToAction(' ', false)).toBe('next')
    expect(keyToAction(' ', true)).toBe('prev')
  })
  test('g / G jump to the ends; unknown keys are ignored', () => {
    expect(keyToAction('g', false)).toBe('first')
    expect(keyToAction('G', true)).toBe('last')
    expect(keyToAction('x', false)).toBeNull()
  })
  test('wpm clamps to 100-600', () => {
    expect(clampWpm(40)).toBe(100)
    expect(clampWpm(900)).toBe(600)
  })
})
