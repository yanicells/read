import { useEffect } from 'react'
import { FONT_OPTIONS } from '../../lib/settings'
import { DEFAULT_SETTINGS, type Settings } from '../../lib/types'
import { Select } from '../ui/Select'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { WidthNote } from './WidthNote'

const PREVIEW = 'Reading feels lighter when your eyes have an anchor.'

/** Live sample of bionic bolding: bolds the leading fraction of each word. */
function BionicPreview({ intensity }: { intensity: number }) {
  return (
    <p className="mt-2 text-sm leading-relaxed text-sub">
      {PREVIEW.split(' ').map((word, i) => {
        const n = Math.max(1, Math.round(word.length * intensity))
        return (
          <span key={i}>
            <b className="font-bold text-text">{word.slice(0, n)}</b>
            {word.slice(n)}{' '}
          </span>
        )
      })}
    </p>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs lowercase text-sub">{title}</h3>
      {children}
    </section>
  )
}

/** Slim right-side drawer over a dimmed backdrop. Esc or backdrop click closes. */
export function SettingsPanel({
  open,
  onClose,
  settings,
  update,
}: {
  open: boolean
  onClose: () => void
  settings: Settings
  update: (patch: Partial<Settings>) => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-label="Settings"
        className={`absolute inset-y-0 right-0 flex w-80 max-w-full flex-col gap-7 overflow-y-auto bg-surface px-6 py-6 transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Group title="text">
          <Select
            value={settings.font}
            onChange={(font) => update({ font })}
            options={FONT_OPTIONS.map((f) => ({ value: f.id, label: f.label, hint: f.note, className: f.className }))}
          />
          <Slider label="size" value={settings.fontSize} min={16} max={50} format={(v) => `${v}px`} onChange={(fontSize) => update({ fontSize })} />
          <Slider label="width" value={settings.lineWidth} min={45} max={90} format={(v) => `${v}ch`} onChange={(lineWidth) => update({ lineWidth })} />
          <WidthNote settings={settings} />
        </Group>

        <Group title="bionic">
          <Toggle label="bionic reading" checked={settings.bionic} onChange={(bionic) => update({ bionic })} />
          <Slider
            label="intensity"
            value={Math.round(settings.bionicIntensity * 100)}
            min={20}
            max={70}
            step={5}
            format={(v) => `${v}%`}
            onChange={(v) => update({ bionicIntensity: v / 100 })}
          />
          {settings.bionic ? (
            <BionicPreview intensity={settings.bionicIntensity} />
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-sub">{PREVIEW}</p>
          )}
        </Group>

        <Group title="pacing">
          <Toggle label="auto-advance" checked={settings.autoAdvance} onChange={(autoAdvance) => update({ autoAdvance })} />
          <Slider label="speed" value={settings.wpm} min={100} max={600} step={10} format={(v) => `${v} wpm`} onChange={(wpm) => update({ wpm })} />
          <Toggle label="idle nudge" checked={settings.idleNudge} onChange={(idleNudge) => update({ idleNudge })} />
          <Slider label="nudge after" value={settings.idleSeconds} min={10} max={90} format={(v) => `${v}s`} onChange={(idleSeconds) => update({ idleSeconds })} />
          <Toggle label="check-ins" checked={settings.checkIns} onChange={(checkIns) => update({ checkIns })} />
        </Group>

        <Group title="theme">
          <div className="flex gap-1 rounded-md bg-surface-2 p-0.5 text-sm" role="radiogroup" aria-label="Theme">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={settings.theme === t}
                onClick={() => update({ theme: t })}
                className={`flex-1 cursor-pointer rounded px-3 py-1 transition-colors ${
                  settings.theme === t ? 'bg-bg text-accent' : 'text-sub hover:text-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Group>

        <button
          type="button"
          onClick={() => update(DEFAULT_SETTINGS)}
          className="mt-auto cursor-pointer self-start text-xs text-sub transition-colors hover:text-text"
        >
          reset to defaults
        </button>
      </aside>
    </div>
  )
}
