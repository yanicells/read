import type { SavedDoc } from './types'

const DOC_KEY = 'read:doc'

/** Reads the last pasted document, or null if none / storage is unavailable. */
export function loadDoc(): SavedDoc | null {
  try {
    const raw = localStorage.getItem(DOC_KEY)
    return raw ? (JSON.parse(raw) as SavedDoc) : null
  } catch {
    return null
  }
}

export function saveDoc(doc: SavedDoc): void {
  try {
    localStorage.setItem(DOC_KEY, JSON.stringify(doc))
  } catch {
    // Storage full or blocked: reading still works, it just won't persist.
  }
}

export function clearDoc(): void {
  try {
    localStorage.removeItem(DOC_KEY)
  } catch {
    // ignore
  }
}
