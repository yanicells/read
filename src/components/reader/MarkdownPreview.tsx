import { useMemo } from 'react'
import { parseChunks } from '../../lib/markdown'
import { chunkSpacing } from '../../lib/layout'
import { ChunkStyles, ChunkView } from './ChunkView'

/** Plain rendered markdown for the editor: no focus, dimming or bionic, just a check of how it looks. */
export function MarkdownPreview({ markdown }: { markdown: string }) {
  const chunks = useMemo(() => parseChunks(markdown), [markdown])

  return (
    <div className="min-h-[60vh] w-full flex-1 text-text">
      <ChunkStyles />
      {chunks.map((chunk) => (
        <div key={chunk.id} className={chunkSpacing(chunk)}>
          <ChunkView chunk={chunk} html={chunk.html} />
        </div>
      ))}
    </div>
  )
}
