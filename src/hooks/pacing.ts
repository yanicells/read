import type { Chunk } from '../lib/types'

export const WPM_MIN = 100
export const WPM_MAX = 600
export const WPM_STEP = 20

/** Everything a hotkey can trigger. */
export type PacingAction =
  | 'next'
  | 'prev'
  | 'first'
  | 'last'
  | 'auto'
  | 'focus'
  | 'bionic'
  | 'theme'
  | 'wpmDown'
  | 'wpmUp'
  | 'help'
  | 'settings'
  | 'escape'
  | 'newText'

/** Maps a KeyboardEvent.key (+ shift) to an action, or null if the key isn't bound. */
export function keyToAction(key: string, shift: boolean): PacingAction | null {
  switch (key) {
    case ' ':
      return shift ? 'prev' : 'next'
    case 'ArrowDown':
    case 'ArrowRight':
    case 'j':
      return 'next'
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'k':
      return 'prev'
    case 'Home':
    case 'g':
      return 'first'
    case 'End':
    case 'G':
      return 'last'
    case 'a':
      return 'auto'
    case 'f':
      return 'focus'
    case 'b':
      return 'bionic'
    case 't':
      return 'theme'
    case '[':
      return 'wpmDown'
    case ']':
      return 'wpmUp'
    case '?':
      return 'help'
    case ',':
      return 'settings'
    case 'Escape':
      return 'escape'
    case 'n':
      return 'newText'
    default:
      return null
  }
}

/** Keeps wpm inside the supported range. */
export function clampWpm(wpm: number): number {
  return Math.min(WPM_MAX, Math.max(WPM_MIN, Math.round(wpm)))
}

/**
 * How long auto-advance lingers on a chunk: word count at the given wpm (floor 1.5s),
 * 1.5x for dense code/tables, and a quick fixed beat for headings and dividers.
 */
export function dwellMs(chunk: Chunk, wpm: number): number {
  if (chunk.kind === 'heading') return 1200
  if (chunk.kind === 'hr') return 1000
  const base = Math.max(1500, (chunk.wordCount / wpm) * 60000)
  return chunk.kind === 'code' || chunk.kind === 'table' ? base * 1.5 : base
}

/** Index of the first chunk in a section (0 if the section is unknown). */
export function sectionStart(chunks: Chunk[], section: number): number {
  const i = chunks.findIndex((c) => c.section === section)
  return i === -1 ? 0 : i
}

/** Words left to read, counting the current chunk. */
export function wordsLeft(chunks: Chunk[], index: number): number {
  let total = 0
  for (let i = index; i < chunks.length; i++) total += chunks[i].wordCount
  return total
}
