import type { FontId } from '../../lib/types'

/** FontId -> Tailwind font class (literal strings so Tailwind can detect them). */
export const FONT_CLASS: Record<FontId, string> = {
  atkinson: 'font-atkinson',
  literata: 'font-literata',
  lexend: 'font-lexend',
  system: 'font-system',
}
