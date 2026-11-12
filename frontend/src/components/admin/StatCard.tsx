export function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-card border border-line bg-panel p-4 shadow-card">
      <p className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] font-medium text-ink-muted">{delta}</p>
    </div>
  )
}
