// Shared contracts between modules. Change only with care: every feature builds on these.

/** One focusable unit of the document: what Space/↓ steps through. */
export type ChunkKind =
  | 'heading'
  | 'paragraph'
  | 'list-item'
  | 'blockquote'
  | 'code'
  | 'table'
  | 'hr'

export interface Chunk {
  /** Stable index-based id, e.g. "c12". */
  id: string
  kind: ChunkKind
  /** Heading level 1–6 for headings, nesting depth for list items, else 0. */
  level: number
  /** Rendered HTML for this chunk alone (no bionic applied). */
  html: string
  /** Plain text, used for word counts / pacing. */
  text: string
  wordCount: number
  /** Index of the section this chunk belongs to (increments at each heading). */
  section: number
  /** True when this is the last chunk before the next heading (or document end). */
  endsSection: boolean
  /** For list items: whether the parent list is ordered, and the item's number. */
  ordered?: boolean
  start?: number
}

export type ThemeMode = 'dark' | 'light'
export type FontId = 'atkinson' | 'literata' | 'lexend' | 'system'

export interface Settings {
  theme: ThemeMode
  font: FontId
  /** Reading (focus) font size in px. */
  fontSize: number
  /** Font size in px for the paste/editing screen. */
  editorFontSize: number
  /** Max line width in `ch`. */
  lineWidth: number
  bionic: boolean
  /** Fraction of each word to bold, 0.2–0.7. */
  bionicIntensity: number
  /** Auto-advance chunks on a timer. */
  autoAdvance: boolean
  /** Words per minute used to time auto-advance. */
  wpm: number
  /** Pulse the current chunk after idling. */
  idleNudge: boolean
  /** Seconds of inactivity before the nudge. */
  idleSeconds: number
  /** Ask "Got it?" at the end of each section. */
  checkIns: boolean
  /** Show only the current chunk. */
  deepFocus: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  font: 'atkinson',
  fontSize: 20,
  editorFontSize: 18,
  lineWidth: 65,
  bionic: true,
  bionicIntensity: 0.45,
  autoAdvance: false,
  wpm: 230,
  idleNudge: true,
  idleSeconds: 25,
  checkIns: false,
  deepFocus: false,
}

/** The one saved document and where the reader stopped. */
export interface SavedDoc {
  markdown: string
  index: number
  updatedAt: number
}
