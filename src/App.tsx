import { useEffect, useMemo, useState } from 'react'
import { CheckIn } from './components/pacing/CheckIn'
import { HelpOverlay } from './components/pacing/HelpOverlay'
import { StatusBar } from './components/pacing/StatusBar'
import { PasteScreen } from './components/reader/PasteScreen'
import { Reader } from './components/reader/Reader'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { TopBar } from './components/settings/TopBar'
import { usePacing } from './hooks/usePacing'
import { parseChunks } from './lib/markdown'
import { useSettings } from './lib/settings'
import { clearDoc, loadDoc, saveDoc } from './lib/storage'

/** Root: owns the document + reading position and wires the feature modules together. */
export default function App() {
  const { settings, update } = useSettings()
  const [markdown, setMarkdown] = useState<string | null>(() => loadDoc()?.markdown ?? null)
  const [index, setIndex] = useState(() => loadDoc()?.index ?? 0)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const chunks = useMemo(() => (markdown ? parseChunks(markdown) : []), [markdown])

  // Persist position as the reader moves.
  useEffect(() => {
    if (markdown) saveDoc({ markdown, index, updatedAt: Date.now() })
  }, [markdown, index])

  const startNew = () => {
    clearDoc()
    setMarkdown(null)
    setIndex(0)
  }

  const pacing = usePacing({
    chunks,
    index,
    setIndex,
    settings,
    update,
    active: markdown !== null,
    onNewText: startNew,
    settingsOpen,
    setSettingsOpen,
  })

  return (
    <div className="min-h-screen bg-bg text-text">
      <TopBar
        hasDoc={markdown !== null}
        onNewText={startNew}
        onOpenSettings={() => setSettingsOpen(true)}
        settings={settings}
        update={update}
      />

      {markdown === null ? (
        <PasteScreen
          settings={settings}
          onSubmit={(md) => {
            setMarkdown(md)
            setIndex(0)
          }}
        />
      ) : (
        <>
          <Reader
            chunks={chunks}
            index={index}
            onSelect={setIndex}
            settings={settings}
            nudging={pacing.nudging}
          />
          <StatusBar chunks={chunks} index={index} settings={settings} pacing={pacing} />
        </>
      )}

      {pacing.checkIn && <CheckIn section={pacing.checkIn.section} onResolve={pacing.resolveCheckIn} />}
      <HelpOverlay open={pacing.helpOpen} onClose={() => pacing.setHelpOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        update={update}
      />
    </div>
  )
}
