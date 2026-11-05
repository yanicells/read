import { useLayoutEffect, useRef, useState } from 'react'
import { maxFittingCh } from '../../lib/layout'
import { FONT_OPTIONS } from '../../lib/settings'
import type { FontId } from '../../lib/types'

/**
 * Quiet hint under the width slider: shows up only when the chosen width can't fit on
 * this screen at the given font size, so the slider never seems to "do nothing".
 */
export function WidthNote({ font, fontSize, lineWidth }: { font: FontId; fontSize: number; lineWidth: number }) {
  const probe = useRef<HTMLSpanElement>(null)
  const [fits, setFits] = useState<number | null>(null)
  const fontClass = FONT_OPTIONS.find((f) => f.id === font)?.className ?? ''

  useLayoutEffect(() => {
    const measure = () => {
      const chPx = probe.current?.getBoundingClientRect().width
      if (chPx) setFits(maxFittingCh(chPx, window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [font, fontSize])

  return (
    <>
      <span
        ref={probe}
        aria-hidden
        className={`${fontClass} pointer-events-none invisible absolute`}
        style={{ fontSize: `${fontSize}px`, width: '1ch' }}
      />
      {fits !== null && fits < lineWidth && (
        <p className="text-xs text-sub">screen fits ~{fits}ch at this size</p>
      )}
    </>
  )
}
