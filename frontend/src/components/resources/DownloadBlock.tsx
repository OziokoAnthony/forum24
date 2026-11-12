import { useState } from 'react'
import { Check, Download, FileText, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { ResourceDoc } from '../../data/content'
import { getDocumentPdf, saveBlob } from '../../lib/documentPdf'
import { Button } from '../ui/Button'

type State = 'idle' | 'working' | 'done' | 'error'

/**
 * The download is a plain button with no ad interaction, no countdown and no
 * "unlock" step. That is a hard AdSense compliance requirement, and the button
 * produces a real, openable file.
 */
export function DownloadBlock({ doc }: { doc: ResourceDoc }) {
  const [state, setState] = useState<State>('idle')

  async function download() {
    setState('working')
    try {
      const blob = await getDocumentPdf(doc)
      saveBlob(blob, `${doc.slug}.pdf`)
      setState('done')
    } catch {
      setState('error')
    }
  }

  const label =
    state === 'working'
      ? 'Preparing file…'
      : state === 'done'
        ? 'Downloaded'
        : `Download ${doc.format === 'PDF' ? 'PDF' : doc.format}`

  return (
    <div className="rounded-card border border-line bg-panel p-5 shadow-card">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-red-50 text-[10px] font-extrabold text-red-700">
          {doc.format}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">Download this document</h2>
          <p className="mt-0.5 text-[13px] font-medium text-ink-muted">
            {doc.format} · {doc.size} · {doc.pages} pages
          </p>
        </div>
      </div>

      {doc.downloadable ? (
        <>
          <Button
            onClick={download}
            disabled={state === 'working'}
            aria-live="polite"
            className="mt-4 w-full"
          >
            {state === 'working' ? (
              <Loader2 size={17} aria-hidden="true" className="animate-spin" />
            ) : state === 'done' ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <Download size={17} aria-hidden="true" />
            )}
            {label}
          </Button>

          {state === 'error' ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-700">
              <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
              The file could not be prepared. Try again, or report the problem on the contact
              page.
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-muted">
              <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-green-700" />
              Downloads immediately. No ad click, countdown or unlock step is required.
            </p>
          )}
        </>
      ) : (
        <>
          <Button disabled className="mt-4 w-full">
            <FileText size={17} aria-hidden="true" />
            View only
          </Button>
          <p className="mt-2 text-xs text-ink-muted">
            The publisher has disabled downloads for this document. You can still read the
            preview on this page.
          </p>
        </>
      )}
    </div>
  )
}
