import type { CSSProperties } from 'react'
import type { Settings } from './types'

/** Space kept free on each side of the text column, so big text never runs to the screen edge. */
const SIDE_GUTTER_REM = 4

/**
 * Style for the reading column. Font size and width live on the same element so `ch`
 * is measured at the reading size, and the width is capped to the viewport minus gutters.
 */
export function columnStyle({ fontSize, lineWidth }: Pick<Settings, 'fontSize' | 'lineWidth'>): CSSProperties {
  return {
    fontSize: `${fontSize}px`,
    maxWidth: `min(${lineWidth}ch, calc(100vw - ${SIDE_GUTTER_REM * 2}rem))`,
  }
}

/**
 * How many `ch` actually fit on screen at this font size, given one `ch` in px.
 * Used to tell the user when the width slider is being limited by the screen.
 */
export function maxFittingCh(chPx: number, viewportPx: number, remPx = 16): number {
  return Math.floor((viewportPx - SIDE_GUTTER_REM * 2 * remPx) / chPx)
}
