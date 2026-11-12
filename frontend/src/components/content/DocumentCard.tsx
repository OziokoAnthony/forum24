import { Link } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import type { ResourceDoc } from '../../data/content'
import { Cover } from '../ui/Cover'

export function DocumentCard({ doc }: { doc: ResourceDoc }) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-panel shadow-card hover:shadow-card-hover lift">
      <Link to={`/resources/documents/${doc.slug}`} tabIndex={-1} aria-hidden="true" className="relative block">
        <Cover tone={doc.cover} className="aspect-[4/3]" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-panel/95 px-2 py-1 text-[11px] font-extrabold text-ink shadow-sm">
          <FileText size={12} aria-hidden="true" />
          {doc.format}
        </span>
        {!doc.downloadable && (
          <span className="absolute top-3 right-3 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-bold text-white">
            View only
          </span>
        )}
      </Link>
      <div className="p-5">
        <h3 className="text-[17px] leading-snug font-bold">
          <Link to={`/resources/documents/${doc.slug}`} className="text-ink hover:text-sky-700">
            {doc.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{doc.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink-muted">
          <span>{doc.size}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Download size={13} aria-hidden="true" />
            {doc.downloads.toLocaleString()}
          </span>
          <span aria-hidden="true">·</span>
          <span className="line-clamp-1">{doc.category}</span>
        </p>
      </div>
    </article>
  )
}
