import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { DEFAULT_SETTINGS, type FontId, type Settings } from './types'
import './fonts'

const STORAGE_KEY = 'read:settings'

/** Font choices for the settings UI; className maps to the font families in index.css. */
export const FONT_OPTIONS: { id: FontId; label: string; note: string; className: string }[] = [
  { id: 'atkinson', label: 'Atkinson Hyperlegible', note: 'made for legibility', className: 'font-atkinson' },
  { id: 'literata', label: 'Literata', note: 'serif, book-like', className: 'font-literata' },
  { id: 'lexend', label: 'Lexend', note: 'designed to reduce visual stress', className: 'font-lexend' },
  { id: 'system', label: 'System', note: 'your OS font', className: 'font-system' },
]

/** Saved settings merged over defaults, so fields added later get sane values. */
function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    // Corrupt JSON or storage blocked: fall back to defaults.
  }
  return DEFAULT_SETTINGS
}

/** Single source of truth for reader settings: persisted to localStorage, theme applied to <html>. Call once (in App). */
export function useSettings(): { settings: Settings; update: (patch: Partial<Settings>) => void } {
  const [settings, setSettings] = useState<Settings>(load)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Storage full or unavailable: settings just won't persist.
    }
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }, [])

  return { settings, update }
}
