import type { Settings } from '../../lib/types'

const icon = {
  viewBox: '0 0 24 24',
  className: 'size-[18px]',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="cursor-pointer rounded-md p-2 text-sub transition-colors hover:text-text focus-visible:text-text"
    >
      <svg {...icon}>{children}</svg>
    </button>
  )
}

/** Fixed, transparent top bar: wordmark left, new-text / theme / settings icons right. Fades to low opacity while reading. */
export function TopBar({
  hasDoc,
  onNewText,
  onOpenSettings,
  settings,
  update,
}: {
  hasDoc: boolean
  onNewText: () => void
  onOpenSettings: () => void
  settings: Settings
  update: (p: Partial<Settings>) => void
}) {
  const dark = settings.theme === 'dark'
  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-3 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100 ${
        hasDoc ? 'opacity-30' : ''
      }`}
    >
      <div className="flex items-center gap-2 font-mono text-sm text-sub select-none">
        <span className="size-1.5 rounded-full bg-accent" />
        read
      </div>
      <nav className="flex items-center gap-1">
        {hasDoc && (
          <IconButton label="New text" onClick={onNewText}>
            <path d="M12 5v14M5 12h14" />
          </IconButton>
        )}
        <IconButton label={dark ? 'Light theme' : 'Dark theme'} onClick={() => update({ theme: dark ? 'light' : 'dark' })}>
          {dark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
            </>
          ) : (
            <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
          )}
        </IconButton>
        <IconButton label="Settings" onClick={onOpenSettings}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
        </IconButton>
      </nav>
    </header>
  )
}
