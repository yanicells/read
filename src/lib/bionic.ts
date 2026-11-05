// Tag-aware string tokenizer (no DOM) so it also runs under `bun test`.

/** Tags whose text content must be left untouched. */
const SKIP_TAG = /^<(\/)?(code|pre|kbd|samp|script|style)\b/i

// Alt 1: an HTML entity (kept whole). Alt 2: a word, allowing inner apostrophes (incl. the &#39; marked emits).
const TOKEN =
  /(&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);)|([\p{L}\p{M}\p{N}]+(?:(?:['’]|&#39;|&apos;)[\p{L}\p{M}\p{N}]+)*)/giu

const ALL_DIGITS = /^\p{N}+$/u
// Bionic makes no sense for scripts without word spaces.
const UNSPACED_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u
// One visible character: an entity-encoded apostrophe, or a code point plus its combining marks.
const UNIT = /&#39;|&apos;|[\s\S]\p{M}*/gu

function boldWord(word: string, intensity: number): string {
  if (ALL_DIGITS.test(word) || UNSPACED_SCRIPT.test(word)) return word
  const units = word.match(UNIT)
  if (!units) return word
  const len = units.length
  const n = len <= 3 ? 1 : Math.min(len, Math.max(1, Math.ceil(len * intensity)))
  return `<b class="bionic">${units.slice(0, n).join('')}</b>${units.slice(n).join('')}`
}

function boldText(text: string, intensity: number): string {
  return text.replace(TOKEN, (match, entity?: string) => (entity ? match : boldWord(match, intensity)))
}

/**
 * Bolds the leading part of each word in an HTML string (`intensity` = fraction of letters, 0–1).
 * Tags, entities, numbers and anything inside code/pre/kbd are left untouched.
 */
export function applyBionic(html: string, intensity: number): string {
  const k = Math.min(1, Math.max(0, intensity))
  let skipDepth = 0
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        const m = SKIP_TAG.exec(part)
        if (m) skipDepth = Math.max(0, skipDepth + (m[1] ? -1 : 1))
        return part
      }
      return skipDepth > 0 || !part ? part : boldText(part, k)
    })
    .join('')
}
