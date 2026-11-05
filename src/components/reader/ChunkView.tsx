import type { Chunk } from '../../lib/types'

/** Scoped styles for rendered chunk HTML, the current-chunk marker, nudge pulse and deep-focus fade. */
const CSS = `
.read-prose { line-height: 1.65; overflow-wrap: break-word; }
.read-prose > :first-child { margin-top: 0; }
.read-prose > :last-child { margin-bottom: 0; }
.read-prose p { margin: 0; }
.read-prose h1, .read-prose h2, .read-prose h3,
.read-prose h4, .read-prose h5, .read-prose h6 { margin: 0; font-weight: 700; line-height: 1.25; }
.read-prose h1 { font-size: 2em; }
.read-prose h2 { font-size: 1.55em; }
.read-prose h3 { font-size: 1.3em; }
.read-prose h4, .read-prose h5, .read-prose h6 { font-size: 1.1em; }
.read-prose a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.read-prose strong { font-weight: 700; color: color-mix(in srgb, var(--accent) 70%, var(--text)); }
.read-prose b.bionic { font-weight: 700; color: var(--text); }
.read-prose code { font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); border-radius: 0.3rem; padding: 0.12em 0.4em; }
.read-prose pre { margin: 0; background: var(--surface); border-radius: 0.5rem; padding: 1em 1.2em; overflow-x: auto; font-size: 0.82em; line-height: 1.6; }
.read-prose pre code { background: none; padding: 0; font-size: inherit; }
.read-prose table { border-collapse: collapse; font-size: 0.88em; display: block; overflow-x: auto; }
.read-prose th, .read-prose td { border-bottom: 1px solid var(--line); padding: 0.35em 1.2em 0.35em 0; text-align: left; }
.read-prose th { font-weight: 700; }
.read-prose blockquote { margin: 0; padding-left: 1.1em; border-left: 2px solid var(--line); color: var(--sub); font-style: normal; }
.read-prose hr { border: 0; border-top: 1px solid var(--line); margin: 0.5em 0; }
.read-prose img { max-width: 100%; }

.read-chunk { transition: opacity 400ms ease; }
.read-chunk::before {
  content: ''; position: absolute; left: -1.25rem; top: 0.2em; bottom: 0.2em; width: 2px;
  border-radius: 2px; background: var(--accent); opacity: 0; transition: opacity 300ms ease;
}
.read-chunk[data-current='true']::before { opacity: 0.55; }
.read-chunk[data-nudge='true']::before { animation: read-nudge-bar 1.8s ease-in-out infinite; }
.read-fade { animation: read-fade-in 350ms ease both; }

@keyframes read-nudge-bar { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
@keyframes read-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .read-chunk, .read-chunk::before { transition: none; }
  .read-chunk[data-nudge='true']::before, .read-fade { animation: none; }
}
`

/** Render once inside the reader; carries all component-scoped CSS. */
export function ChunkStyles() {
  return <style>{CSS}</style>
}

/** Bullet or number shown before a list item. */
function listMarker(chunk: Chunk): string {
  if (chunk.ordered) return `${chunk.start ?? 1}.`
  return chunk.level === 0 ? '•' : '–'
}

/** One chunk's content. List items get a drawn bullet/number, indented by nesting level. */
export function ChunkView({ chunk, html }: { chunk: Chunk; html: string }) {
  const body = <div className="read-prose min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: html }} />

  if (chunk.kind !== 'list-item') return body

  return (
    <div className="flex gap-3" style={{ paddingLeft: `${chunk.level * 1.5}em` }}>
      <span className="w-[1.4em] shrink-0 text-right tabular-nums text-sub select-none">
        {listMarker(chunk)}
      </span>
      {body}
    </div>
  )
}
