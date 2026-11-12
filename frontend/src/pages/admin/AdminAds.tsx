import { useState } from 'react'
import { CircleAlert, Megaphone, Monitor, Smartphone } from 'lucide-react'

const placements = [
  { id: 'home-leaderboard', name: 'Homepage leaderboard', page: 'Homepage', device: 'All', slot: '1234567890', enabled: true },
  { id: 'article-inline', name: 'In-article (after paragraph 2)', page: 'Article', device: 'All', slot: '2345678901', enabled: true },
  { id: 'article-preconclusion', name: 'Pre-conclusion', page: 'Article', device: 'All', slot: '3456789012', enabled: true },
  { id: 'article-sidebar', name: 'Sidebar', page: 'Article', device: 'Desktop', slot: '4567890123', enabled: true },
  { id: 'doc-detail', name: 'Document detail', page: 'Document', device: 'All', slot: '5678901234', enabled: true },
  { id: 'video-below', name: 'Below video player', page: 'Video', device: 'All', slot: '6789012345', enabled: true },
  { id: 'resource-list', name: 'Resource listing', page: 'Resources', device: 'All', slot: '7890123456', enabled: false },
]

export function AdminAds() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(placements.map((placement) => [placement.id, placement.enabled])),
  )

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <h2 className="text-xl font-extrabold">Advertising</h2>
        <p className="text-sm text-ink-muted">
          Placements are labelled, separated from content, and never gate a download or a video.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <CircleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        <p>
          <span className="font-extrabold">Compliance:</span> ads must remain distinguishable from
          content and controls. Never require an ad click to download a document or play a video.
          Never encourage clicks or generate artificial traffic.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-card border border-line bg-panel shadow-card">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <Megaphone size={17} aria-hidden="true" className="text-sky-600" />
            <h3 className="text-base font-extrabold">Placements</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                  <th className="px-4 py-2.5 font-bold">Placement</th>
                  <th className="px-4 py-2.5 font-bold">Page</th>
                  <th className="px-4 py-2.5 font-bold">Device</th>
                  <th className="px-4 py-2.5 font-bold">Slot ID</th>
                  <th className="px-4 py-2.5 text-right font-bold">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((placement) => (
                  <tr key={placement.id} className="border-t border-line hover:bg-sky-50">
                    <td className="px-4 py-3 font-semibold text-ink">{placement.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{placement.page}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft">
                        {placement.device === 'Desktop' ? (
                          <Monitor size={13} aria-hidden="true" />
                        ) : (
                          <Smartphone size={13} aria-hidden="true" />
                        )}
                        {placement.device}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-muted">{placement.slot}</td>
                    <td className="px-4 py-3 text-right">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <span className="sr-only">Toggle {placement.name}</span>
                        <input
                          type="checkbox"
                          checked={enabled[placement.id]}
                          onChange={(event) =>
                            setEnabled({ ...enabled, [placement.id]: event.target.checked })
                          }
                          className="h-4 w-4 accent-sky-600"
                        />
                        <span className="text-[12px] font-semibold text-ink-muted">
                          {enabled[placement.id] ? 'On' : 'Off'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Document page wireframe
            </h3>
            <div className="mt-3 grid gap-1.5 rounded-control border border-line bg-cloud p-2 text-[10px] font-semibold text-ink-muted">
              <div className="rounded bg-panel px-2 py-3">Title + description</div>
              <div className="rounded bg-slate-200 px-2 py-6 text-center text-slate-600">PDF preview</div>
              <div className="rounded border border-dashed border-ad-line bg-ad-bg px-2 py-4 text-center">
                <span className="text-[9px] tracking-[0.08em] uppercase">Advertisement</span>
              </div>
              <div className="rounded bg-sky-600 px-2 py-2 text-center text-white">Download PDF</div>
              <div className="rounded bg-panel px-2 py-2">Related documents</div>
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">
              The ad is separate from the preview and the download button. The download works
              whether or not an ad is clicked.
            </p>
          </div>

          <div className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Consent</h3>
            <p className="mt-2 text-[13px] text-ink-soft">
              Cookie consent is required before personalised ads. “Reject” is as easy to find as
              “Accept”.
            </p>
            <button type="button" className="mt-2 text-[13px] font-bold text-sky-700 hover:underline">
              Open consent settings →
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
