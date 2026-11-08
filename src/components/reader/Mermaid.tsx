import { useEffect, useId, useRef, useState } from 'react'
import type { ThemeMode } from '../../lib/types'

/**
 * A Mermaid diagram drawn in the app's greys, redrawn when the theme flips. Mermaid is loaded
 * on first use. If the source doesn't parse, the raw code shows instead.
 */
export function Mermaid({ source, theme }: { source: string; theme: ThemeMode }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const box = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const run = { cancelled: false }
    void (async () => {
      const { default: mermaid } = await import('mermaid')
      const css = getComputedStyle(document.documentElement)
      const token = (name: string) => css.getPropertyValue(name).trim()
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
        theme: 'base',
        fontFamily: box.current ? getComputedStyle(box.current).fontFamily : 'sans-serif',
        themeVariables: {
          darkMode: theme === 'dark',
          background: token('--bg'),
          primaryColor: token('--surface'),
          primaryTextColor: token('--text'),
          primaryBorderColor: token('--sub'),
          secondaryColor: token('--surface-2'),
          tertiaryColor: token('--bg'),
          lineColor: token('--sub'),
          textColor: token('--text'),
          noteBkgColor: token('--surface-2'),
          noteTextColor: token('--text'),
          fontSize: '15px',
        },
      })
      try {
        const result = await mermaid.render(`${id}-${theme}`, source)
        if (!run.cancelled) setSvg(result.svg)
      } catch {
        if (!run.cancelled) setFailed(true)
      }
    })()
    return () => {
      run.cancelled = true
    }
  }, [source, id, theme])

  if (failed) {
    return (
      <div className="read-prose">
        <pre>
          <code>{source}</code>
        </pre>
      </div>
    )
  }
  return (
    <div ref={box} className="overflow-x-auto">
      {svg ? (
        <div className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div aria-hidden className="h-48 rounded-lg bg-surface/60" />
      )}
    </div>
  )
}
