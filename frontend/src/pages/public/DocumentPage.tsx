import { Link, useParams } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { documents, getDoc } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Chip } from '../../components/ui/Chip'
import { DocumentCard } from '../../components/content/DocumentCard'
import { PdfViewer } from '../../components/resources/PdfViewer'
import { DownloadBlock } from '../../components/resources/DownloadBlock'
import { NotFoundPage } from './NotFoundPage'

export function DocumentPage() {
  const { slug = '' } = useParams()
  const doc = getDoc(slug)

  if (!doc) return <NotFoundPage />

  const related = documents
    .filter((item) => item.slug !== doc.slug)
    .sort((a, b) => (a.category === doc.category ? -1 : 0) - (b.category === doc.category ? -1 : 0))
    .slice(0, 3)

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Learning Centre', to: '/resources' },
            { label: 'Documents', to: '/resources?tab=documents' },
            { label: doc.title },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <header>
            <Chip>{doc.category}</Chip>
            <h1 className="mt-3 max-w-[24ch] text-[28px] leading-[1.15] font-extrabold sm:text-[36px]">
              {doc.title}
            </h1>
            <p className="mt-2 max-w-[64ch] text-[16px] text-ink-soft">{doc.description}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink-muted">
              <span className="inline-flex items-center gap-1 font-bold text-ink">
                <FileText size={14} aria-hidden="true" />
                {doc.format}
              </span>
              <span aria-hidden="true">·</span>
              <span>{doc.size}</span>
              <span aria-hidden="true">·</span>
              <span>{doc.pages} pages</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Download size={13} aria-hidden="true" />
                {doc.downloads.toLocaleString()} downloads
              </span>
              <span aria-hidden="true">·</span>
              <span>Published {doc.published}</span>
            </p>
          </header>

          <div className="mt-5">
            <PdfViewer doc={doc} />
          </div>

          {/* Ad is outside the viewer and well clear of the download button. */}
          <AdSlot minHeight={250} hint="Document page placement · separate from the download control" />

          <DownloadBlock doc={doc} />

          <section className="mt-8">
            <h2 className="text-[20px] font-extrabold">About this document</h2>
            <dl className="mt-3 grid gap-2 rounded-card border border-line bg-panel p-5 text-sm shadow-card sm:grid-cols-2">
              <div>
                <dt className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">Publisher</dt>
                <dd className="mt-0.5 font-semibold text-ink">{doc.publisher}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">Licence</dt>
                <dd className="mt-0.5 font-semibold text-ink">{doc.licence}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">Version</dt>
                <dd className="mt-0.5 font-semibold text-ink">{doc.version}</dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold tracking-[0.04em] text-ink-muted uppercase">Published</dt>
                <dd className="mt-0.5 font-semibold text-ink">{doc.published}</dd>
              </div>
            </dl>
          </section>

          <p className="mt-4 text-xs text-ink-muted">
            Something wrong with this file?{' '}
            <Link to="/contact" className="font-semibold text-sky-700 hover:underline">
              Report a problem
            </Link>
            .
          </p>
        </div>

        <aside className="grid content-start gap-5">
          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              {doc.downloadable ? 'Download' : 'Access'}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {doc.downloadable
                ? 'The download button is below the preview and is never blocked by an advertisement.'
                : 'This document is view only. The preview below stays available without an account.'}
            </p>
            <div className="mt-3 rounded-control bg-sky-50 p-3 text-[12px] text-sky-800">
              {doc.downloadable
                ? 'Available to everyone. No account required.'
                : 'View only — the publisher has disabled downloads.'}
            </div>
          </div>

          <AdSlot minHeight={250} hint="Sidebar placement · desktop only" />

          <div>
            <h2 className="mb-3 text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Related documents
            </h2>
            <div className="grid gap-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/resources/documents/${item.slug}`}
                  className="flex items-center gap-3 rounded-control border border-line bg-panel p-3 shadow-card hover:border-sky-300"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-[10px] font-extrabold text-red-700">
                    {item.format}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-bold text-ink">{item.title}</span>
                    <span className="text-[12px] text-ink-muted">
                      {item.size} · {item.downloads.toLocaleString()} downloads
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[22px] font-extrabold">More from the Learning Centre</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <DocumentCard key={`card-${item.slug}`} doc={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
