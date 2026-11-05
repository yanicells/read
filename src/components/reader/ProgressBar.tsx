/** Thin accent bar fixed at the top of the viewport showing how far through the doc we are. */
export function ProgressBar({ index, total }: { index: number; total: number }) {
  const pct = total > 0 ? ((index + 1) / total) * 100 : 0
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5">
      <div
        className="h-full bg-accent transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
