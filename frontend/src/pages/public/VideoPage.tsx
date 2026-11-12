import { Link, useParams } from 'react-router-dom'
import { Eye, Video as VideoIcon } from 'lucide-react'
import { getVideo, videos } from '../../data/content'
import { AdSlot } from '../../components/ui/AdSlot'
import { Breadcrumbs } from '../../components/ui/Breadcrumbs'
import { Chip } from '../../components/ui/Chip'
import { VideoPlayer } from '../../components/resources/VideoPlayer'
import { VideoCard } from '../../components/content/VideoCard'
import { NotFoundPage } from './NotFoundPage'

export function VideoPage() {
  const { slug = '' } = useParams()
  const video = getVideo(slug)

  if (!video) return <NotFoundPage />

  const related = videos
    .filter((item) => item.slug !== video.slug)
    .sort((a, b) => (a.category === video.category ? -1 : 0) - (b.category === video.category ? -1 : 0))
    .slice(0, 3)

  return (
    <div className="fade-up">
      <div className="mt-5">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Learning Centre', to: '/resources' },
            { label: 'Videos', to: '/resources?tab=videos' },
            { label: video.title },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <VideoPlayer video={video} />

          <header className="mt-5">
            <Chip>{video.category}</Chip>
            <h1 className="mt-3 max-w-[26ch] text-[26px] leading-[1.15] font-extrabold sm:text-[34px]">
              {video.title}
            </h1>
            <p className="mt-2 max-w-[64ch] text-[16px] text-ink-soft">{video.description}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink-muted">
              <span className="inline-flex items-center gap-1 font-bold text-ink">
                <VideoIcon size={14} aria-hidden="true" />
                {video.provider}
              </span>
              <span aria-hidden="true">·</span>
              <span>{video.duration}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Eye size={13} aria-hidden="true" />
                {video.views.toLocaleString()} views
              </span>
              <span aria-hidden="true">·</span>
              <span>Published {video.published}</span>
            </p>
          </header>

          <div className="mt-6 rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-[18px] font-extrabold">About this video</h2>
            <p className="mt-2 text-sm text-ink-soft">
              This lesson is part of the FORUM24 Learning Centre. It plays inside the website;
              you do not need to leave the page to watch. If the provider blocks embedding, a
              clear fallback link is shown instead of a broken player.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              The player supports play/pause, seeking, mute, captions and full screen, and every
              control is reachable from the keyboard.
            </p>
          </div>

          <section
            className="mt-5 rounded-card border border-line bg-panel p-5 shadow-card"
            aria-labelledby="transcript-heading"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="transcript-heading" className="text-[18px] font-extrabold">
                Transcript
              </h2>
              <p className="text-[12px] font-medium text-ink-muted">
                Captions follow this text
              </p>
            </div>
            <ol className="mt-3 grid gap-3">
              {video.transcript.map((line, index) => (
                <li key={line} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mist text-[11px] font-bold text-sky-700 tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-line pt-3 text-[12px] text-ink-muted">
              Transcript supplied by the publisher. It is edited for clarity, never generated
              and published without review.
            </p>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <AdSlot minHeight={250} hint="Video page placement · below the player, never over controls" />

          <div>
            <h2 className="mb-3 text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Related videos
            </h2>
            <div className="grid gap-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/resources/videos/${item.slug}`}
                  className="flex items-center gap-3 rounded-control border border-line bg-panel p-3 shadow-card hover:border-sky-300"
                >
                  <span className="grid h-10 w-14 shrink-0 place-items-center rounded-md bg-sky-100 text-sky-700">
                    <VideoIcon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-bold text-ink">{item.title}</span>
                    <span className="text-[12px] text-ink-muted">
                      {item.duration} · {item.views.toLocaleString()} views
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-line bg-panel p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              Watch next
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Prefer reading? The Learning Centre also has downloadable documents and guides.
            </p>
            <Link
              to="/resources?tab=documents"
              className="mt-3 inline-flex min-h-10 items-center rounded-control btn-3d px-3 text-sm font-bold"
            >
              Browse documents
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[22px] font-extrabold">More videos</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <VideoCard key={`card-${item.slug}`} video={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
