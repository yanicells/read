import { dwellMs, wordsLeft } from '../../hooks/pacing'
import type { PacingState } from '../../hooks/usePacing'
import type { Chunk, Settings } from '../../lib/types'

/** Tiny bottom bar: position + time left, auto-advance state, help hint. Faint until hovered or auto runs. */
export function StatusBar({
  chunks,
  index,
  settings,
  pacing,
}: {
  chunks: Chunk[]
  index: number
  settings: Settings
  pacing: PacingState
}) {
  const { autoRunning, autoPaused } = pacing
  const minutes = Math.ceil(wordsLeft(chunks, index) / settings.wpm)
  const dwell = chunks[index] ? dwellMs(chunks[index], settings.wpm) : 1
  const progress = Math.min(1, pacing.remainingMs / dwell)

  let auto = <span>manual</span>
  if (autoRunning) {
    auto = (
      <span className="flex items-center gap-2 text-accent">
        auto · {settings.wpm} wpm
        <span className="h-px w-10 bg-line">
          <span
            className="block h-px bg-accent transition-[width] duration-[250ms] ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </span>
    )
  } else if (autoPaused) {
    auto = <span className="text-accent">paused — space to resume</span>
  } else if (settings.autoAdvance) {
    auto = <span className="text-accent">auto · waiting</span>
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 items-center px-4 py-2 font-mono text-xs text-sub transition-opacity duration-200 select-none hover:opacity-100 focus-within:opacity-100 ${
        settings.autoAdvance ? 'opacity-100' : 'opacity-30'
      }`}
    >
      <span>
        {index + 1} / {chunks.length} · {minutes < 1 ? '<1' : `~${minutes}`} min left
      </span>
      <button
        type="button"
        data-keep-auto
        onClick={pacing.toggleAuto}
        className="justify-self-center hover:text-text"
        title="Toggle auto-advance (a)"
      >
        {auto}
      </button>
      <button
        type="button"
        onClick={() => pacing.setHelpOpen(true)}
        className="justify-self-end hover:text-text"
      >
        ? keys
      </button>
    </div>
  )
}
