import { useEffect, useState } from 'react'
import { ExternalLink, FileText, Loader2, Maximize2, Minimize2, TriangleAlert } from 'lucide-react'
import type { ResourceDoc } from '../../data/content'
import { getDocumentPdf } from '../../lib/documentPdf'

/**
 * Real PDF preview. The file is generated in the browser from the document
 * record, so the viewer shows an actual PDF rather than a picture of one.
 * The frame has a reserved height so nothing shifts when it appears.
 */
export function PdfViewer({ doc }: { doc: ResourceDoc }) {
  const [expanded, setExpanded] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    setUrl(null)
    setFailed(false)

    getDocumentPdf(doc)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc])

  return (
    <div className="overflow-hidden rounded-control border border-line bg-panel shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cloud px-3 py-2.5">
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-ink">
          <FileText size={15} aria-hidden="true" className="text-sky-600" />
          Document preview
        </span>

        <div className="flex items-center gap-1.5">
          <span className="mr-1 hidden text-[12px] font-medium text-ink-muted sm:inline">
            Sample excerpt · {doc.pages}-page edition
          </span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-bold text-sky-700 hover:bg-sky-50"
            >
              <ExternalLink size={13} aria-hidden="true" />
              Open
            </a>
          )}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md text-ink-muted hover:bg-sky-50 hover:text-sky-700"
            aria-label={expanded ? 'Collapse preview' : 'Expand preview'}
            aria-pressed={expanded}
          >
            {expanded ? (
              <Minimize2 size={15} aria-hidden="true" />
            ) : (
              <Maximize2 size={15} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`relative bg-slate-100 ${expanded ? 'h-[80vh]' : 'h-[420px] sm:h-[560px]'}`}
      >
        {url ? (
          <iframe
            src={`${url}#view=FitH`}
            title={`Preview of ${doc.title}`}
            className="h-full w-full border-0"
          />
        ) : failed ? (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <TriangleAlert size={26} aria-hidden="true" className="mx-auto text-amber-600" />
              <p className="mt-2 text-sm font-bold text-ink">The preview could not be built</p>
              <p className="mx-auto mt-1 max-w-[44ch] text-[13px] text-ink-soft">
                Your browser blocked the in-page viewer. Use the download button below to read
                the document.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center p-6">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted">
              <Loader2 size={16} aria-hidden="true" className="animate-spin text-sky-600" />
              Preparing the preview…
            </p>
          </div>
        )}
      </div>

      <p className="border-t border-line bg-cloud px-3 py-2 text-center text-[11px] text-ink-muted">
        {doc.downloadable
          ? 'The preview is a sample excerpt. The download is the complete file — and it is never blocked by an advertisement.'
          : 'The preview is a sample excerpt. The publisher has disabled downloads for this document.'}
      </p>
    </div>
  )
}
