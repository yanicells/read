import { memo, useEffect, useMemo, useRef } from 'react'
import { applyBionic } from '../../lib/bionic'
import { columnStyle } from '../../lib/layout'
import type { Chunk, Settings } from '../../lib/types'
import { chunkSpacing } from '../../lib/layout'
import { ChunkStyles, ChunkView } from './ChunkView'
import { FONT_CLASS } from './fonts'
import { ProgressBar } from './ProgressBar'

interface ReaderProps {
  chunks: Chunk[]
  index: number
  onSelect: (i: number) => void
  settings: Settings
  nudging: boolean
}

/** Text of the nearest heading before (not including) chunk `i`, for deep-focus context. */
function sectionLabel(chunks: Chunk[], i: number): string | null {
  for (let j = i - 1; j >= 0; j--) if (chunks[j].kind === 'heading') return chunks[j].text
  return null
}

/** Vertical rhythm: headings get more air above, list items sit close together. */
/**
 * The reading column. Shows all chunks with the current one highlighted and the rest dimmed,
 * or (deep focus) only the current chunk centered on screen.
 */
export const Reader = memo(function Reader({ chunks, index, onSelect, settings, nudging }: ReaderProps) {
  const { font, fontSize, lineWidth, bionic, bionicIntensity, deepFocus } = settings
  const currentRef = useRef<HTMLDivElement>(null)
  const firstScroll = useRef(true)

  // Bionic is applied per chunk, except for blocks where bolding word prefixes would be noise.
  const htmls = useMemo(
    () =>
      chunks.map((c) =>
        bionic && c.kind !== 'code' && c.kind !== 'table' ? applyBionic(c.html, bionicIntensity) : c.html,
      ),
    [chunks, bionic, bionicIntensity],
  )

  // Keep the current chunk centered; jump instantly on first mount and with reduced motion.
  useEffect(() => {
    if (deepFocus) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    currentRef.current?.scrollIntoView({
      block: 'center',
      behavior: reduce || firstScroll.current ? 'auto' : 'smooth',
    })
    firstScroll.current = false
  }, [index, deepFocus])

  const current = chunks[index]
  const style = columnStyle({ fontSize, lineWidth })
  const columnClass = `${FONT_CLASS[font]} relative mx-auto w-full px-6 text-text`

  if (deepFocus) {
    const label = current ? sectionLabel(chunks, index) : null
    return (
      <>
        <ChunkStyles />
        <ProgressBar index={index} total={chunks.length} />
        <main className="flex min-h-screen items-center py-24">
          <div className={columnClass} style={style}>
            {current && (
              <div key={current.id} className="read-fade">
                {label && (
                  <div className="mb-5 truncate text-[0.7em] tracking-wide text-sub lowercase">{label}</div>
                )}
                <div
                  className="read-chunk relative"
                  data-current="true"
                  data-nudge={nudging}
                >
                  <ChunkView chunk={current} html={htmls[index]} theme={settings.theme} />
                </div>
              </div>
            )}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <ChunkStyles />
      <ProgressBar index={index} total={chunks.length} />
      <main className="py-[45vh]">
        <div className={columnClass} style={style}>
          {chunks.map((chunk, i) => {
            const isCurrent = i === index
            return (
              <div
                key={chunk.id}
                ref={isCurrent ? currentRef : undefined}
                onClick={isCurrent ? undefined : () => onSelect(i)}
                data-current={isCurrent}
                data-nudge={isCurrent && nudging}
                className={`read-chunk relative ${chunkSpacing(chunk)} ${
                  isCurrent ? 'opacity-100' : 'cursor-pointer opacity-25 hover:opacity-40'
                }`}
              >
                <ChunkView chunk={chunk} html={htmls[i]} theme={settings.theme} />
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
})
