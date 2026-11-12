import { Link } from 'react-router-dom'
import { Play, Video as VideoIcon } from 'lucide-react'
import type { Video } from '../../data/content'
import { Cover } from '../ui/Cover'

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="group overflow-hidden rounded-card border border-line bg-panel shadow-card hover:shadow-card-hover lift">
      <Link
        to={`/resources/videos/${video.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block"
      >
        <Cover tone={video.cover} className="aspect-video" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-sky-600 text-white shadow-[inset_0_2px_0_rgb(255_255_255_/_0.4),0_4px_0_#0d3f7d,0_12px_20px_-10px_rgb(26_111_216_/_0.85)] transition group-hover:scale-105">
            <Play size={22} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
        <span className="absolute right-3 bottom-3 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-bold text-white">
          {video.duration}
        </span>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.04em] text-ink-muted uppercase">
          <VideoIcon size={13} aria-hidden="true" />
          {video.provider}
        </div>
        <h3 className="mt-2 text-[17px] leading-snug font-bold">
          <Link to={`/resources/videos/${video.slug}`} className="text-ink hover:text-sky-700">
            {video.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{video.description}</p>
        <p className="mt-3 text-[13px] font-medium text-ink-muted">
          {video.views.toLocaleString()} views <span aria-hidden="true">·</span> {video.published}
        </p>
      </div>
    </article>
  )
}
