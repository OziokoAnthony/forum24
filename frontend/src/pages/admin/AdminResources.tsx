import { useState } from 'react'
import { FileText, Plus, Upload, Video as VideoIcon, X } from 'lucide-react'
import { documents, videos } from '../../data/content'
import { Button } from '../../components/ui/Button'

type Tab = 'documents' | 'videos'

export function AdminResources() {
  const [tab, setTab] = useState<Tab>('documents')
  const [showUpload, setShowUpload] = useState(false)

  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloads, 0)
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0)

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Resources</h2>
          <p className="text-sm text-ink-muted">Documents, videos and their categories.</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus size={16} aria-hidden="true" />
          Upload resource
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Documents',
            value: documents.length.toString(),
            note: `${documents.filter((doc) => doc.downloadable).length} downloadable`,
          },
          { label: 'Downloads', value: totalDownloads.toLocaleString(), note: 'All time' },
          {
            label: 'Videos',
            value: videos.length.toString(),
            note: `${videos.filter((video) => video.embeddable).length} embeddable`,
          },
          { label: 'Video views', value: totalViews.toLocaleString(), note: 'All time' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card border border-line bg-panel p-4 shadow-card">
            <p className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">{stat.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{stat.value}</p>
            <p className="text-[12px] text-ink-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-line bg-panel shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab('documents')}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[9px] px-3 text-sm font-bold ${
                tab === 'documents' ? 'bg-sky-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35),0_2px_0_#0d3f7d]' : 'text-ink-soft hover:bg-sky-50'
              }`}
            >
              <FileText size={15} aria-hidden="true" />
              Documents
            </button>
            <button
              type="button"
              onClick={() => setTab('videos')}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[9px] px-3 text-sm font-bold ${
                tab === 'videos' ? 'bg-sky-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.35),0_2px_0_#0d3f7d]' : 'text-ink-soft hover:bg-sky-50'
              }`}
            >
              <VideoIcon size={15} aria-hidden="true" />
              Videos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === 'documents' ? (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                  <th className="px-4 py-2.5 font-bold">Title</th>
                  <th className="px-4 py-2.5 font-bold">Format</th>
                  <th className="px-4 py-2.5 font-bold">Category</th>
                  <th className="px-4 py-2.5 text-right font-bold">Downloads</th>
                  <th className="px-4 py-2.5 font-bold">Download</th>
                  <th className="px-4 py-2.5 font-bold">Published</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.slug} className="border-t border-line hover:bg-sky-50">
                    <td className="max-w-[340px] px-4 py-3">
                      <p className="line-clamp-1 font-semibold text-ink">{doc.title}</p>
                      <p className="text-[12px] text-ink-muted">{doc.size} · {doc.pages} pages</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-extrabold text-red-700">{doc.format}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{doc.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">{doc.downloads.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          doc.downloadable ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {doc.downloadable ? 'Allowed' : 'View only'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-muted">{doc.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                  <th className="px-4 py-2.5 font-bold">Title</th>
                  <th className="px-4 py-2.5 font-bold">Provider</th>
                  <th className="px-4 py-2.5 font-bold">Category</th>
                  <th className="px-4 py-2.5 text-right font-bold">Views</th>
                  <th className="px-4 py-2.5 font-bold">Embed</th>
                  <th className="px-4 py-2.5 font-bold">Published</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.slug} className="border-t border-line hover:bg-sky-50">
                    <td className="max-w-[340px] px-4 py-3">
                      <p className="line-clamp-1 font-semibold text-ink">{video.title}</p>
                      <p className="text-[12px] text-ink-muted">{video.duration}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{video.provider}</td>
                    <td className="px-4 py-3 text-ink-soft">{video.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">{video.views.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          video.embeddable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {video.embeddable ? 'Embeddable' : 'Fallback link'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-muted">{video.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-xs text-ink-muted">
        Downloads are served from a private bucket through short-lived signed URLs. Large video
        files are processed in the background and delivered by CDN, not from the API server.
      </p>

      {showUpload && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="upload-title" className="w-full max-w-lg rounded-sheet border border-line bg-panel p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="upload-title" className="text-lg font-extrabold">Upload a resource</h2>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="grid h-9 w-9 place-items-center rounded-control text-ink-muted hover:bg-sky-50"
                aria-label="Close upload dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 rounded-control border border-dashed border-line-strong bg-cloud p-6 text-center">
              <Upload size={24} aria-hidden="true" className="mx-auto text-sky-600" />
              <p className="mt-2 text-sm font-bold">Drag a file here, or choose one</p>
              <p className="text-[11px] text-ink-muted">PDF, DOCX, PPTX, MP4 or WebM · up to 500 MB</p>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <label htmlFor="upload-title-field" className="block text-[12px] font-bold text-ink">Title</label>
                <input id="upload-title-field" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="upload-type" className="block text-[12px] font-bold text-ink">Type</label>
                  <select id="upload-type" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm">
                    <option>Document</option>
                    <option>Video</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="upload-category" className="block text-[12px] font-bold text-ink">Category</label>
                  <select id="upload-category" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm">
                    <option>Education &amp; Technology</option>
                    <option>Technology &amp; AI</option>
                    <option>Business &amp; Finance</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-control border border-line bg-cloud px-3 py-2 text-sm font-semibold">
                Allow downloads
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-sky-600" />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button onClick={() => setShowUpload(false)}>Upload &amp; process</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
