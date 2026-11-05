import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Chunk, Settings } from '../lib/types'
import { WPM_STEP, clampWpm, dwellMs, keyToAction, sectionStart } from './pacing'

export interface PacingState {
  /** Idle too long: the current chunk should pulse. */
  nudging: boolean
  /** Auto-advance is on, not paused, and no overlay/check-in is blocking it. */
  autoRunning: boolean
  /** Auto-advance is on but paused by user activity (scroll, click, blur). */
  autoPaused: boolean
  /** `a` key / status bar: resume if paused, otherwise toggle auto-advance. */
  toggleAuto: () => void
  /** Open "got it?" prompt at the end of a section, else null. */
  checkIn: { section: number } | null
  resolveCheckIn: (action: 'continue' | 'reread') => void
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
  /** Time left on the current chunk while auto-running (0 otherwise). Updates ~4x/sec. */
  remainingMs: number
}

interface PacingOptions {
  chunks: Chunk[]
  index: number
  setIndex: (i: number) => void
  settings: Settings
  update: (patch: Partial<Settings>) => void
  active: boolean
  onNewText: () => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
}

const TICK_MS = 250

/** True when keystrokes belong to a form control rather than the reader. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  )
}

/**
 * Pacing layer: hotkeys, timed auto-advance, idle nudge and section check-ins.
 * Owns no reading position; it drives the caller's `index` through `setIndex`.
 * Event handlers read the latest props via a ref so listeners are attached once.
 */
export function usePacing(opts: PacingOptions): PacingState {
  const { chunks, index, settings, active, settingsOpen } = opts
  const [helpOpen, setHelpOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [nudging, setNudging] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [checkInState, setCheckInState] = useState<{ section: number; from: number } | null>(null)

  const checkIn = active ? checkInState : null
  const autoEnabled = settings.autoAdvance && active && chunks.length > 0
  const autoRunning = autoEnabled && !paused && !checkIn && !settingsOpen && !helpOpen
  const autoPaused = autoEnabled && paused

  // Latest values for stable listeners. Synced before any later event can fire.
  const snapshot = { ...opts, helpOpen, paused, checkIn }
  const live = useRef(snapshot)
  useLayoutEffect(() => {
    live.current = snapshot
  })

  /** Move to chunk i (clamped). Updates the ref immediately so fast key repeats don't double-read. */
  const go = useCallback((i: number) => {
    const s = live.current
    const next = Math.min(s.chunks.length - 1, Math.max(0, i))
    if (next === s.index) return
    live.current = { ...s, index: next }
    s.setIndex(next)
  }, [])

  /** Step forward, or ask for a check-in first when leaving a section end. */
  const goNext = useCallback(() => {
    const { chunks, index, settings } = live.current
    if (index >= chunks.length - 1) return
    const current = chunks[index]
    if (settings.checkIns && current.endsSection && current.kind !== 'heading') {
      setCheckInState({ section: current.section, from: index })
      return
    }
    go(index + 1)
  }, [go])

  const resolveCheckIn = useCallback(
    (action: 'continue' | 'reread') => {
      const { checkIn, chunks } = live.current
      if (!checkIn) return
      setCheckInState(null)
      go(action === 'continue' ? checkIn.from + 1 : sectionStart(chunks, checkIn.section))
    },
    [go],
  )

  const toggleAuto = useCallback(() => {
    const s = live.current
    setPaused(false)
    if (s.settings.autoAdvance && s.paused) return // resume only
    if (!s.settings.autoAdvance && s.index >= s.chunks.length - 1) return // nothing left to run
    s.update({ autoAdvance: !s.settings.autoAdvance })
  }, [])

  // Drop a check-in once the reader has moved off the chunk that raised it.
  useEffect(() => {
    if (checkInState && (!active || checkInState.from !== index)) setCheckInState(null)
  }, [active, checkInState, index])

  // A fresh start (auto turned off) clears any stale pause.
  useEffect(() => {
    if (!settings.autoAdvance) setPaused(false)
  }, [settings.autoAdvance])

  // Hotkeys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return
      const s = live.current
      const action = keyToAction(e.key, e.shiftKey)

      // Esc works even inside inputs so the settings panel can always be dismissed.
      if (action === 'escape') {
        if (s.helpOpen) setHelpOpen(false)
        else if (s.settingsOpen) s.setSettingsOpen(false)
        else if (s.checkIn) setCheckInState(null)
        else return
        e.preventDefault()
        return
      }
      if (isEditable(e.target)) return

      const handled = () => {
        e.preventDefault()
        // A focused button would otherwise also "click" on Space/Enter.
        if (document.activeElement instanceof HTMLButtonElement) document.activeElement.blur()
      }

      if (action === 'help') {
        if (!e.repeat) setHelpOpen(!s.helpOpen)
        handled()
        return
      }
      if (s.helpOpen || s.settingsOpen) return

      if (s.checkIn) {
        const k = e.key.toLowerCase()
        if (k === 'y' || k === 'enter') resolveCheckIn('continue')
        else if (k === 'r') resolveCheckIn('reread')
        else if (!action) return
        handled()
        return
      }

      // Without a document only theme and settings make sense.
      if (!s.active && action !== 'theme' && action !== 'settings') return
      if (!action) return
      // Held keys may scroll through chunks, but never re-fire toggles.
      if (e.repeat && action !== 'next' && action !== 'prev') {
        handled()
        return
      }

      const { settings } = s
      switch (action) {
        case 'next':
          if (e.key === ' ') setPaused(false) // Space also resumes a paused auto-advance
          goNext()
          break
        case 'prev':
          go(s.index - 1)
          break
        case 'first':
          go(0)
          break
        case 'last':
          go(s.chunks.length - 1)
          break
        case 'auto':
          toggleAuto()
          break
        case 'focus':
          s.update({ deepFocus: !settings.deepFocus })
          break
        case 'bionic':
          s.update({ bionic: !settings.bionic })
          break
        case 'theme':
          s.update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          break
        case 'wpmDown':
          s.update({ wpm: clampWpm(settings.wpm - WPM_STEP) })
          break
        case 'wpmUp':
          s.update({ wpm: clampWpm(settings.wpm + WPM_STEP) })
          break
        case 'settings':
          s.setSettingsOpen(true)
          break
        case 'newText':
          if (window.confirm('Start a new text? The current one will be cleared.')) s.onNewText()
          break
      }
      handled()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, goNext, resolveCheckIn, toggleAuto])

  // Auto-advance: one timeout per chunk; changing index (auto or manual) re-arms it.
  const wpm = settings.wpm
  useEffect(() => {
    if (!autoRunning) return
    const chunk = live.current.chunks[index]
    if (!chunk) return
    const dwell = dwellMs(chunk, wpm)
    const deadline = performance.now() + dwell
    setRemaining(dwell)
    const timer = setTimeout(() => {
      const s = live.current
      if (s.index >= s.chunks.length - 1) s.update({ autoAdvance: false })
      else goNext()
    }, dwell)
    const tick = setInterval(() => setRemaining(Math.max(0, deadline - performance.now())), TICK_MS)
    return () => {
      clearTimeout(timer)
      clearInterval(tick)
    }
  }, [autoRunning, index, chunks, wpm, goNext])

  // Pause auto-advance when attention moves elsewhere (scroll, click, tab/window blur).
  useEffect(() => {
    if (!autoRunning) return
    const pause = () => setPaused(true)
    const onClick = (e: MouseEvent) => {
      // The status bar's auto toggle manages pause state itself.
      if (e.target instanceof Element && e.target.closest('[data-keep-auto]')) return
      pause()
    }
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('click', onClick)
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('wheel', pause)
      window.removeEventListener('click', onClick)
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [autoRunning])

  // Idle nudge: stays on until the next keypress/click/scroll, then re-arms.
  const nudgeEnabled = settings.idleNudge && active && !autoRunning
  const idleSeconds = settings.idleSeconds
  useEffect(() => {
    setNudging(false)
    if (!nudgeEnabled) return
    let timer: ReturnType<typeof setTimeout>
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setNudging(true), idleSeconds * 1000)
    }
    const onActivity = () => {
      setNudging(false)
      arm()
    }
    arm()
    const events = ['keydown', 'click', 'wheel'] as const
    for (const name of events) window.addEventListener(name, onActivity, { passive: true })
    return () => {
      clearTimeout(timer)
      for (const name of events) window.removeEventListener(name, onActivity)
    }
  }, [nudgeEnabled, idleSeconds])

  return {
    nudging: nudging && nudgeEnabled,
    autoRunning,
    autoPaused,
    toggleAuto,
    checkIn,
    resolveCheckIn,
    helpOpen,
    setHelpOpen,
    remainingMs: autoRunning ? remaining : 0,
  }
}
